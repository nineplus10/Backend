import { randomUUID } from "crypto";
import { createServer, IncomingMessage, Server } from "http";
import { WebSocket, WebSocketServer } from "ws";
import { Cache, Message, OnConnectionCloseFx, OnErrorFx, Response, ServeFx } from ".";
import { z } from "zod";
import { ZodValidator } from "_lib/validation/zod";
import { AppErr, AppError } from "_lib/error/application";
import { URL } from "url";
import { AccountApi } from "_lib/external/account";
import Stream from "stream";
import { HttpErrorAdapter } from "_lib/error/adapter/http";

type OnCloseFx = OnConnectionCloseFx<number>

export abstract class WsRouter {
    abstract serve(msg: Message, res: Response, onError: OnErrorFx): void

    /**
     * Matches payload destination to routers using longest matching substring 
     * strategy. Wildcards aren't supported.
     * 
     * @returns [router, matchingRouteLength]
     */ 
    protected _resolve(
        destination: string,
        routes: [string, ServeFx][]
    ): [ServeFx | undefined, number] {
        const match: [ServeFx | undefined, number] = [undefined, -1]
        routes.forEach(r => {
            const [route, serveFx] = r
            const isBetterCandidate = destination.startsWith(route)
                                    && route.length > match[1]
            if(isBetterCandidate) {
                match[0] = serveFx
                match[1] = route.length
            }
        })

        match[1]++ // Plus delimiter
        return match
    }
}

/**Websocket Response based on `ws` package */
export class WsResponse implements Response {
    meta: Response["meta"];

    constructor(
        private readonly _sendFx: (payload: any) => void
    ) {
        this.meta = {
            status: "OK"
        }
    }

    send(payload?: any) {
        this._sendFx(JSON.stringify({
            meta: this.meta,
            data: payload}
        ))
    }

    status(s: Response["meta"]["status"]): WsResponse {
        this.meta.status = s; return this
    }
    reason(r: Response["meta"]["reason"]): WsResponse {
        this.meta.reason = r; return this
    }
}

/**Websocket message based on `ws` package */
export class WsMessage implements Message {
    static VALID_MESSAGE = z.object({
        meta: z.object({
            destination: z.string()
        }),
        data: z.record(z.string(), z.any())
    })

    meta: { destination: string; };
    data: { [k: string]: any; };

    constructor(messageLike: object) {
        const validator = new ZodValidator<
            z.infer<typeof WsMessage.VALID_MESSAGE>
                >( WsMessage.VALID_MESSAGE)
        const {data, error} = validator.validate(messageLike)
        if(error)
            throw new AppError(
                AppErr.BadRequest,
                "Invalid message structure")

        this.meta = data.meta
        this.data = data.data
    }
}

export class WsConnectionManager {
    private readonly _srv: Server
    private readonly _wsSrv: WebSocketServer
    private readonly _connections: {
        [k: string]: {
            player: number,
            connection: WebSocket
        }
    }
    private readonly _subscribers: {
        onMessage: ServeFx[],
        onClose: OnCloseFx[]
    }

    constructor( 
        accountApi: AccountApi,
        private readonly _connectionCache: Cache,
    ) {
        this._subscribers = {
            onMessage: [],
            onClose: []
        }
        this._connections = {}
        this._wsSrv = new WebSocketServer({noServer: true })
        this._srv = createServer()

        this._srv.on("upgrade", async(req, socket, head) => {
            const 
                parsedUrl = URL.parse(req.url!, `http://${req.headers.host}`) 
                            ?? URL.parse(req.url!, `https://${req.headers.host}`),
                token = parsedUrl?.searchParams.get("token"),
                userAgent = req.headers["user-agent"]

            if(!token || !userAgent) {
                this.rejectUpgrade(req, socket, 
                    new AppError(AppErr.BadRequest, "Missing `token` and `userAgent`"))
                return
            }

            const tokenPayload = await accountApi
                .inferWithRefreshToken(userAgent, token)
                .catch(err => this.rejectUpgrade(req, socket, err))
            if(!tokenPayload) return

            const connName = (await _connectionCache.find(tokenPayload.player.id)).pop()
            if(connName && this._connections[connName]) {
                this.rejectUpgrade(req, socket,
                    new AppError(AppErr.Forbidden, "Can't create new connection as the previous one is still active")
                )
                return
            }


            // HTTP upgrade: https://github.com/websockets/ws?tab=readme-ov-file#multiple-servers-sharing-a-single-https-server
            this._wsSrv.handleUpgrade(req, socket, head, async(ws, _) => {
                const connectionId = randomUUID()
                this._connections[connectionId] = {
                    player: tokenPayload.player.id,
                    connection: ws
                }
                await _connectionCache.save(tokenPayload.player.id, connectionId)

                const res = new WsResponse(ws.send.bind(ws))
                res.send({
                    access: tokenPayload.accessToken,
                    refresh: tokenPayload.refreshToken
                })

                ws.on("error", console.error)
                ws.on("close", async(code, reason) => {
                    await Promise.all(this._subscribers.onClose.map(fx => {
                        fx(this._connections[connectionId].player)
                    }))

                    delete this._connections[connectionId]
                    ws.close(code, reason)
                })
                ws.on("message", data => {
                    let msg: WsMessage;
                    try {
                        const payload = JSON.parse(data.toString())
                        payload.data = {
                            ...payload.data,
                            player: tokenPayload.player
                        }
                        msg = new WsMessage(payload)
                    } catch(err) {
                        if(err instanceof SyntaxError) {
                            res.status("ERR")
                                .send("Only valid JSON payload is supported")
                        } else {
                            res.status("ERR")
                                .send("Invalid message structure")
                        }
                        return
                    }

                    this._subscribers.onMessage.forEach(fx => {
                        fx(msg, res, (err) => {
                            res.status("ERR")
                                .reason(err.message)
                                .send()
                        }
                    )})
                })
            })
        })
    }

    async lookUp(identifier: number): Promise<string | undefined> {
        const connName = (await this._connectionCache.find(identifier)).pop()
        return connName
    }

    sendTo(connectionId: string, payload: any): boolean {
        const connection = this._connections[connectionId].connection
        const res = new WsResponse(connection.send.bind(connection))
        res.send(payload)
        return true
    }

    subscribeOnMessage(fx: ServeFx) {
        this._subscribers.onMessage.push(fx)
    }

    subscibeOnClose(fx: OnCloseFx) {
        this._subscribers.onClose.push(fx)
    }

    get websocket(): WsConnectionManager["_wsSrv"] {return this._wsSrv}
    get server(): WsConnectionManager["_srv"] {return this._srv}

    /**
     * Rejects HTTP Upgrade request by sending HTTP response via raw connection 
     * then destroying the socket.
     * 
     * @param req 
     * @param socket 
     * @param statusCode - The statusCode related to the rejection
     * @param errorName - The name of the error related to the rejection
     * @param reason - The reason of rejection
     *
     * @see 
     * - https://stackoverflow.com/questions/62447895/node-js-express-send-raw-http-responses, 
     * - https://ably.com/blog/websocket-authentication
    */
    private rejectUpgrade( req: IncomingMessage, socket: Stream.Duplex, err: Error) {
        if(!(err instanceof AppError)) {
            console.log(err)
            const payload = JSON.stringify({
                message: "Unknown error",
                description: "Please try again later" // TODO: add request id or soemthign for easier diagnosis
            })
            socket.write(
                `HTTP/1.1 500 Internal Server Error\r\n
                Content-Type: application/json\r\n
                Content-Length: ${payload.length}\r\n
                \r\n
                ${payload} `)
            return
        }

        const adapter = new HttpErrorAdapter()
        const {spec, message} = adapter.adapt(err)
        const payload = JSON.stringify({
            message: spec.msg,
            description: message 
        })
        console.log(`[Game] Reject \`${req.socket.remoteAddress}\`: ${spec.errName} - ${message}`)

        socket.write(
            `HTTP/1.1 ${this.statusCodeMsg(spec.statusCode)}\r\n
            Content-Type: application/json\r\n
            Content-Length: ${payload.length}\r\n
            \r\n
            ${payload} `)
        socket.destroy()
    }

    private statusCodeMsg(code: number): string {
        switch(code) {
            case 401: return "401 Unauthorized"
            case 404: return "404 Not Found"
            case 400: return "400 Bad Request"
            default: return "500 Internal Server Error"
        }
    }
}