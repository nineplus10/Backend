import { Valkey } from "_lib/persistence/Valkey"
import { Kafka } from "../_lib/messageBroker/kafka"
import { GameClientRouterV1 } from "./routes/app"
import { gameEnv } from "./env"
import { WsConnectionManager } from "../_lib/websocket/ws"
import { ValkeyMatch } from "./repositories/valkey/valkeyMatch"
import { HighestWinRate } from "./domain/services/matchmaker/strategies/highestWinRate"
import { MatchService } from "./services/match"
import { MatchController } from "./controllers/match"
import { MatchRouter } from "./routes/match"
import { AccountApi } from "_lib/external/account"
import { ValkeyWebsocket } from "./repositories/valkey/valkeyWebsocket"
import { randomUUID } from "crypto"
import { Matchmaker } from "./domain/services/matchmaker"

export class GameClientModule {
    static async start(listenPort: number) {
        const 
            kafka = new Kafka( "test", gameEnv.BROKER_URL),
            valkey = new Valkey(gameEnv.CACHE_URL)

        const websocketCache = new ValkeyWebsocket(valkey.conn)
    
        const matchService = 
            new MatchService(
                new ValkeyMatch(valkey.conn), 
                websocketCache, 
                new Matchmaker(new HighestWinRate()))

        const matchController = new MatchController(matchService)

        const matchRouter = new MatchRouter(matchController)

        const connectionManager = 
            new WsConnectionManager(
                new GameClientRouterV1(matchRouter), 
                new AccountApi(gameEnv.AUTH_REFRESH_URL, "THIS IS MY API KEY"),
                websocketCache,
                async(connectionOwner: number) => {
                    await websocketCache.remove(connectionOwner)
                    await matchService.leavePool(connectionOwner)
                })

        const matchmakeInterval = setInterval(async() => {
            await matchController.matchmake(
                (connectionId: string, payload: object) => {
                    connectionManager.sendTo(
                        <ReturnType<typeof randomUUID>> connectionId,
                        payload)
                }
            )
        }, 3*1000)

        connectionManager.server.listen(listenPort, () => {
            console.log(`[GameClient] Up and running on ${listenPort}`)
        })
    }
}