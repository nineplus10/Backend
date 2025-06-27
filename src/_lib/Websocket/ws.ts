import { randomUUID } from "crypto";
import { createServer, Server } from "http";
import { WebSocket, WebSocketServer } from "ws";
import { WsRouter } from "gameClient/routes";
import { Message, Response } from ".";
import { z } from "zod";
import { ZodValidator } from "_lib/Validator/zod";
import { AppErr, AppError } from "_lib/Error/http/AppError";
import { URL } from "url";

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
            connection: WebSocket
        }
    }

    // TODO: Consider this to be moved somewhere
    private async checkAuth(
        authEndpoint: string, 
        userAgent: string,
        token: string,
    ): Promise<{access: string, refresh: string}>  {
        return await fetch(authEndpoint, {
                method: "POST",
                headers: {
                    "User-Agent": userAgent,
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: new URLSearchParams({
                    refresh_token: token
                })        
            })
            .then(res => {
                return Promise.all([ res.status, res.json() ])
            })
            .then(([statusCode, payload]) => {
                if(statusCode != 200) {
                    switch(statusCode) {
                        case 400: throw new Error("TOKEN_NOT_FOUND")
                        case 401: throw new Error("TOKEN_INVALID")
                        default: throw new Error("UNKNOWN_REASON")
                    }
                }

                let accessTokenOk = true, refreshTokenOk = true
                if(!payload.accessToken) {
                    accessTokenOk = false
                    console.log("[Game] WARN: Missing `accessToken` after successful refresh")
                }
                if(!payload.refreshToken) {
                    refreshTokenOk = false
                    console.log("[Game] WARN: Missing `refreshToken` after successful refresh")
                }
                if(!accessTokenOk || !refreshTokenOk)
                    throw new Error("MALFORMED_NEW_TOKEN")
            
                return {
                    access: payload.accessToken,
                    refresh: payload.refreshToken
                }
            })
    }


    constructor( 
        private readonly _router: WsRouter,
        authEndpoint: string
    ) {
        this._wsSrv = new WebSocketServer({noServer: true })
        this._wsSrv.on("connection", (ws, _) => {
            const res = new WsResponse(ws.send.bind(ws))
            const id = randomUUID()
            this._connections[id] = {
                connection: ws
            }

            ws.on("error", console.error)
            ws.on("close", (code: number, reason) => {
                ws.close(code, reason)
                delete this._connections[id]
            })

            ws.on("message", data => {
                let payload,
                    msg: WsMessage;
                try {
                    payload = JSON.parse(data.toString())
                    msg = new WsMessage(payload)
                } catch(err) {
                    if(err instanceof SyntaxError) {
                        res.status("ERR")
                            .send("Only valid JSON payload is supported")
                    } else if(err instanceof AppError) {
                        res.status("ERR")
                            .send("Invalid message structure")
                    }
                    return
                }

                this._router.serve(msg, res, (err: Error) => {
                    res.status("ERR")
                        .reason(err.message)
                        .send()
                })
            })
        })

        // TODO: refactor
        // http upgrade: https://github.com/websockets/ws?tab=readme-ov-file#multiple-servers-sharing-a-single-https-server
        // send raw response: 
        // - https://stackoverflow.com/questions/62447895/node-js-express-send-raw-http-responses
        // - https://ably.com/blog/websocket-authentication
        this._srv = createServer()
        this._srv.on("upgrade", async(req, socket, head) => {
            const parsedUrl = URL.parse(req.url!, `http://${req.headers.host}`)
            const token = parsedUrl?.searchParams.get("token")
            const userAgent = req.headers["user-agent"]
            if(!token || !userAgent) {
                console.log(`[Game] Reject \`${req.socket.remoteAddress}\`: TOKEN_MISSING`)
                // TODO: Send error response

                // const payload = JSON.stringify({
                //     message: "TOKEN_MISSING",
                //     description: "`token` could not be found on query params"
                // })

                // socket.write(
                //     `HTTP/1.1 400 Bad Request\r\n
                //     Content-Type: application/json\r\n
                //     Content-Length: ${payload.length}\r\n
                //     \r\n
                //     ${payload}
                //     `
                // )
                socket.destroy()
                return
            }

            await this.checkAuth(authEndpoint, userAgent, token)
                .then(newToken => {
                    this._wsSrv.handleUpgrade(req, socket, head, ws => {
                        ws.send(JSON.stringify(newToken))
                        console.log(`[Game] Allow \`${req.socket.remoteAddress}\``)
                        this._wsSrv.emit("connection", ws, req)
                    })
                })
                .catch((err: Error) => {
                    // TODO: Send error response
                    console.log(`[Game] Reject \`${req.socket.remoteAddress}\`: ${err}`)
                    socket.destroy()
                    return ""
                })

        })

        this._connections = {}
    }

    get websocket(): WsApp["_wsSrv"] {return this._wsSrv}
    get server(): WsApp["_srv"] {return this._srv}
}