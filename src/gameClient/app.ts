import { KafkaConn } from "./_lib/MessageBroker/kafka"
import { WsApp } from "./_lib/Websocket/ws"
import { GameClientRouterV1 } from "./routes"

export class GameClientModule {
    _app: WsApp

    constructor() {
        const router = new GameClientRouterV1()
        const broker = KafkaConn

        this._app = new WsApp(router)
    }

    get app(): GameClientModule["_app"] {return this._app}

    listen(port: number): ReturnType<typeof this.app.server.listen> {
        return this._app.server.listen(port, () => {
            console.log(`[GameClient] Up and running on ${port}`)
        })
    }
}