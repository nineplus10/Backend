import { Valkey } from "_lib/Persistence/Valkey"
import { Kafka } from "../_lib/MessageBroker/kafka"
import { GameClientRouterV1 } from "./routes/app"
import { gameEnv } from "./env"
import { WsApp } from "../_lib/Websocket/ws"

export class GameClientModule {
    static async start(listenPort: number): Promise<GameClientModule> {
        const kafka = new Kafka( "test", gameEnv.BROKER_URL)
        const valkey = new Valkey(gameEnv.CACHE_URL)

        const router = await GameClientRouterV1.create(valkey.conn, kafka)
        const app = new WsApp(router, gameEnv.AUTH_REFRESH_URL)
        return app.server.listen(listenPort, () => {
            console.log(`[GameClient] Up and running on ${listenPort}`)
        })
    }
}