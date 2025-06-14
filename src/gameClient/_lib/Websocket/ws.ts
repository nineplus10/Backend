import { randomUUID } from "crypto";
import { createServer, Server } from "http";
import { WebSocket, WebSocketServer } from "ws";
import { WsRouter } from "./websocket";

type ConnectionEntry = {
    status: boolean
    messageCount: number
    connection: WebSocket
}

const connections: {
    [k: ReturnType<typeof randomUUID>]: ConnectionEntry
} = { }

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
                const response = this._router.serve(data)
                ws.send(JSON.stringify(response))
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