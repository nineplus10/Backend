import { Valkey } from "_lib/Persistence/Valkey"
import { Kafka } from "../_lib/MessageBroker/kafka"
import { GameClientRouterV1 } from "./routes/app"
import { gameEnv } from "./env"
import { WsApp } from "../_lib/Websocket/ws"
import { ValkeyMatch } from "./repository/valkey/valkeyMatch"
import { HighestWinsMatchmaker } from "./domain/services/matchmaker/highestWins"
import { MatchService } from "./services/match"
import { MatchController } from "./controller/match"
import { MatchRouter } from "./routes/match"

export class GameClientModule {
    static async start(listenPort: number): Promise<GameClientModule> {
        const kafka = new Kafka( "test", gameEnv.BROKER_URL)
        const valkey = new Valkey(gameEnv.CACHE_URL)

        const matchCache = new ValkeyMatch(valkey.conn)
    
        const matchService = new MatchService(matchCache, new HighestWinsMatchmaker())

        const matchController = new MatchController(matchService)

        const matchRouter = new MatchRouter(matchController)

        const matchmakingInterval = 
            setInterval(async() => {
                await matchService.matchmake()
                    .catch(err => {
                        console.error(err.message)
                    })
            }, 3*1000)

        const router = new GameClientRouterV1(matchRouter)

        const app = new WsApp(router, gameEnv.AUTH_REFRESH_URL)
        return app.server.listen(listenPort, () => {
            console.log(`[GameClient] Up and running on ${listenPort}`)
        })
    }
}