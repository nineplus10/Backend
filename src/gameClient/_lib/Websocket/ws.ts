import { randomUUID } from "crypto";
import { createServer, Server } from "http";
import { WebSocket, WebSocketServer } from "ws";
import { WsRouter } from "gameClient/routes";
import { WebsocketMessage, WebsocketResponse } from ".";

export class WsResponse implements WebsocketResponse {
    meta: WebsocketResponse["meta"];

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

    status(s: WebsocketResponse["meta"]["status"]): WsResponse {
        this.meta.status = s; return this
    }
    reason(r: WebsocketResponse["meta"]["reason"]): WsResponse {
        this.meta.reason = r; return this
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
            ws.on("error", console.error)
            ws.on("close", _ => {
                delete this._connections[id]
            })

            const id = randomUUID()
            this._connections[id] = {
                connection: ws
            }

            ws.on("message", data => {
                let payload;
                try {
                    payload = JSON.parse(data.toString())
                } catch(SyntaxError) {
                    ws.send("Only valid JSON payload is supported")
                }

                const message = this.validateMessage(payload)
                if(!message) {
                    ws.send("Invalid message structure")
                    return
                }

                const res = new WsResponse(ws.send.bind(ws))
                this._router.serve(message, res)
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

    private validateMessage(msg: any): WebsocketMessage | undefined {
        const isValid = // I wonder whether there's a better way to do this
            msg.hasOwnProperty("meta")
            && msg.meta.hasOwnProperty("destination")

        return isValid? <WebsocketMessage>msg: undefined
    }

    get server(): WsApp["_srv"] {return this._srv}
}