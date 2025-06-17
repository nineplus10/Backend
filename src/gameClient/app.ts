import { Valkey } from "_lib/Persistence/Valkey"
import { KafkaConn } from "./_lib/MessageBroker/kafka"
import { WsApp } from "./_lib/Websocket/ws"
import { GameClientRouterV1 } from "./routes/app"
import { gameEnv } from "./env"

export class GameClientModule {
    _app: WsApp

    constructor() {
        const brokerConn = KafkaConn
        const vkConn = new Valkey(gameEnv.CACHE_URL)

        const router = new GameClientRouterV1(vkConn, brokerConn)
        this._app = new WsApp(router)
    }

    get app(): GameClientModule["_app"] {return this._app}

    listen(port: number): ReturnType<typeof this.app.server.listen> {
        return this._app.server.listen(port, () => {
            console.log(`[GameClient] Up and running on ${port}`)
        })
    }
}