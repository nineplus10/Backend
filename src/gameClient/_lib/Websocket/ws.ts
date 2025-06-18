import { randomUUID } from "crypto";
import { createServer, Server } from "http";
import { WebSocket, WebSocketServer } from "ws";
import { WsRouter } from "gameClient/routes";
import { Message, Response } from ".";
import { z } from "zod";
import { ZodValidator } from "_lib/Validator/zod";
import { AppErr, AppError } from "_lib/Error/AppError";

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
    private readonly _connections: {
        [k: ReturnType<typeof randomUUID>]: {
            connection: WebSocket
        }
    }

    constructor( private readonly _router: WsRouter) {
        const wsSrv = new WebSocketServer({noServer: true })
        wsSrv.on("connection", ws => {
            const id = randomUUID()
            this._connections[id] = {
                connection: ws
            }

            ws.on("error", console.error)
            ws.on("close", _ => {
                delete this._connections[id]
            })
            ws.on("message", data => {
                const res = new WsResponse(ws.send.bind(ws))
                let payload;
                let msg;
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

        // Adopted from: https://github.com/websockets/ws?tab=readme-ov-file#multiple-servers-sharing-a-single-https-server
        const srv = createServer()
        srv.on("upgrade", (req, socket, head) => {
            wsSrv.handleUpgrade(req, socket, head, function done(ws) {
                wsSrv.emit("connection", ws, req)
            })
        })

        this._connections = {}
        this._srv = srv
    }

    get server(): WsApp["_srv"] {return this._srv}
}