import { Valkey } from "_lib/Persistence/Valkey"
import { Kafka } from "../_lib/MessageBroker/kafka"
import { GameClientRouterV1 } from "./routes/app"
import { gameEnv } from "./env"
import { WsApp } from "../_lib/Websocket/ws"
import { ValkeyMatch } from "./repository/valkey/valkeyMatch"
import { HighestWinRate } from "./domain/services/matchmaker/strategies/highestWinRate"
import { MatchService } from "./services/match"
import { MatchController } from "./controller/match"
import { MatchRouter } from "./routes/match"
import { AccountApi } from "_lib/api/account"
import { ValkeyWebsocket } from "./repository/valkey/valkeyWebsocket"
import { randomUUID } from "crypto"
import { Matchmaker } from "./domain/services/matchmaker"

export class GameClientModule {
    static async start(listenPort: number): Promise<GameClientModule> {
        const kafka = new Kafka( "test", gameEnv.BROKER_URL)
        const valkey = new Valkey(gameEnv.CACHE_URL)
        const accountApi = new AccountApi("THIS IS MY API KEY")

        const matchCache = new ValkeyMatch(valkey.conn)
        const websocketCache = new ValkeyWebsocket(valkey.conn)
    
        const matchService = new MatchService(
            matchCache, 
            websocketCache, 
            new Matchmaker(new HighestWinRate()))

        const matchController = new MatchController(matchService)

        const matchRouter = new MatchRouter(matchController)

        const router = new GameClientRouterV1(matchRouter)

        const app = new WsApp(
            router, 
            gameEnv.AUTH_REFRESH_URL, 
            accountApi,
            websocketCache,
            async(connectionOwner: number) => {
                await websocketCache.remove(connectionOwner)
                await matchService.leavePool(connectionOwner)
            })
        
        const matchmakeInterval = setInterval(async() => {
            await matchController.matchmake(
                (connectionId: string, payload: object) => {
                    app.sendMessageTo(
                        <ReturnType<typeof randomUUID>> connectionId,
                        payload)
                }
            )
        }, 3*1000)

        return app.server.listen(listenPort, () => {
            console.log(`[GameClient] Up and running on ${listenPort}`)
        })
    }
}