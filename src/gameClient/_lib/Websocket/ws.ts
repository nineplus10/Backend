import { randomUUID } from "crypto";
import { createServer, Server } from "http";
import { WebSocket, WebSocketServer } from "ws";
import { WsRouter } from "gameClient/routes";
import { WsResponse } from "gameClient/controller/response";

const connections: {
    [k: ReturnType<typeof randomUUID>]: {
        status: boolean
        messageCount: number
        connection: WebSocket
    }
} = { }

export interface WsMessage {
    meta: {
        destination: string
    }
    data: { 
        [k: string]: any 
    }
}

export class WsApp {
    private readonly _srv: Server

    private saveNewConnection(conn: WebSocket): ReturnType<typeof randomUUID> {
        const uuid = randomUUID()
        connections[uuid] = {
            status: true,
            messageCount: 0,
            connection: conn
        }

        return uuid
    }

    private validateMessage(msg: any): WsMessage | undefined {
        // I wonder whether there's a better way to do this
        const isValid = 
            msg.hasOwnProperty("meta")
            && msg.meta.hasOwnProperty("destination")

        return isValid? <WsMessage>msg: undefined
    }

    constructor( private readonly _router: WsRouter) {
        const wsSrv = new WebSocketServer({noServer: true })
        wsSrv.on("connection", ws => {
            ws.on("error", console.error)
            ws.on("close", _ => {
                delete connections[id]
            })

            const id = this.saveNewConnection(ws)
            ws.on("message", data => {
                connections[id].messageCount++
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

        this._srv = srv
    }

    get server(): WsApp["_srv"] {return this._srv}
}