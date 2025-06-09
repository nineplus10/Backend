import e from "express";
import { createServer, Server as NodeServer } from "node:http";
import { Server as SocketIoServer} from "socket.io";

export class SocketIoApp {
    private readonly _srv: NodeServer

    constructor(app: e.Express)  {
        this._srv = createServer(app)
        const ioSrv = new SocketIoServer(this._srv)

        ioSrv.on("connection", () => {
            console.log("[WBS] Somebody has joined the connection!")
        })
    }

    get server(): SocketIoApp["_srv"] {return this._srv}
}