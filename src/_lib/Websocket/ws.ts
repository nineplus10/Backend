import { randomUUID } from "crypto";
import { createServer, IncomingMessage, Server } from "http";
import { WebSocket, WebSocketServer } from "ws";
import { WsRouter } from "gameClient/routes";
import { Message, Response } from ".";
import { z } from "zod";
import { ZodValidator } from "_lib/Validator/zod";
import { AppErr, AppError } from "_lib/Error/http/AppError";
import { URL } from "url";
import { AccountApi } from "_lib/api/account";
import Stream from "stream";
import { WebsocketCache } from "gameClient/repository/websocket";

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

export class WsApp {
    private readonly _srv: Server
    private readonly _wsSrv: WebSocketServer
    private readonly _connections: {
        [k: ReturnType<typeof randomUUID>]: {
            player: number,
            connection: WebSocket
        }
    }

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
    private rejectUpgrade(
        req: IncomingMessage,
        socket: Stream.Duplex, 
        statusCode: number, 
        errorName: string,
        reason: string,
    ) {
        console.log(`[Game] Reject \`${req.socket.remoteAddress}\`: ${errorName}`)
        const payload = JSON.stringify({
            message: errorName,
            description: reason 
        })

        socket.write(
            `HTTP/1.1 ${statusCode} Bad Request\r\n
            Content-Type: application/json\r\n
            Content-Length: ${payload.length}\r\n
            \r\n
            ${payload} `
        )
        socket.destroy()
    }

     
    // HTTP upgrade: https://github.com/websockets/ws?tab=readme-ov-file#multiple-servers-sharing-a-single-https-server
    constructor( 
        router: WsRouter,
        authEndpoint: string,
        accountApi: AccountApi,
        websocketCache: WebsocketCache,
        onDisconnect: (connectionOwner: number) => Promise<void>
    ) {
        this._connections = {}
        this._wsSrv = new WebSocketServer({noServer: true })
        this._srv = createServer()

        this._srv.on("upgrade", async(req, socket, head) => {
            const parsedUrl = URL.parse(req.url!, `http://${req.headers.host}`)
            const token = parsedUrl?.searchParams.get("token")
            const userAgent = req.headers["user-agent"]
            if(!token || !userAgent) {
                this.rejectUpgrade(req, socket, 
                    400, "BAD_REQUEST", "Both token and user agent should be provided")
                return
            }

            let authOk = true
            const tokenPayload = {
                refreshToken: "", 
                accessToken: "",
                player: {
                    id: -1, 
                    wins: -1, 
                    gamePlayed: -1 
                }
            }
            await accountApi.inferWithRefreshToken(authEndpoint, userAgent, token)
                .then(res => {
                    tokenPayload.refreshToken = res.refreshToken,
                    tokenPayload.accessToken = res.accessToken
                    tokenPayload.player = {
                        id: res.player.id,
                        wins: res.player.wins,
                        gamePlayed: res.player.gamePlayed
                    }
                })
                .catch(err => {
                    authOk = false
                    this.rejectUpgrade(req, socket, 
                        500, "INTERNAL_ERROR", err.message)
                })

            if(!authOk) return

            this._wsSrv.handleUpgrade(req, socket, head, async(ws, req) => {
                const connectionId = randomUUID()
                this._connections[connectionId] = {
                    player: tokenPayload.player.id,
                    connection: ws
                }
                await websocketCache.save(tokenPayload.player.id, connectionId)

                ws.on("error", console.error)
                ws.on("close", async(code: number, reason) => {
                    const connectionOwner = this._connections[connectionId].player
                    await onDisconnect(connectionOwner)

                    delete this._connections[connectionId]
                    ws.close(code, reason)
                })

                const res = new WsResponse(ws.send.bind(ws))
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

                    router.serve(msg, res, (err: Error) => {
                        res.status("ERR")
                            .reason(err.message)
                            .send()
                    })
                })

                console.log(`[Game] Allow \`${req.socket.remoteAddress}\``)
                res.send(tokenPayload)
            })
        })
    }

    sendMessageTo(connectionId: ReturnType<typeof randomUUID>, payload: any): boolean {
        const connection = this._connections[connectionId].connection
        const res = new WsResponse(connection.send.bind(connection))
        res.send(payload)
        return true
    }

    get websocket(): WsApp["_wsSrv"] {return this._wsSrv}
    get server(): WsApp["_srv"] {return this._srv}
}