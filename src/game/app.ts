import { Valkey } from "_lib/persistence/Valkey"
import { Kafka } from "../_lib/messageBroker/kafka"
import { GameClientRouterV1 } from "./routes"
import { gameEnv } from "./env"
import { WsConnectionManager } from "../_lib/websocket/ws"
import { ValkeyMatch } from "./repositories/valkey/valkeyMatch"
import { HighestWinRate } from "./domain/services/matchmaking/strategies/highestWinRate"
import { MatchService } from "./services/match"
import { MatchmakingController } from "./controllers/match"
import { MatchRouter } from "./routes/match"
import { AccountApi } from "_lib/external/account"
import { ValkeyWebsocket } from "./repositories/valkey/valkeyWebsocket"
import { Matchmaker } from "./domain/services/matchmaking/matchmaker"
import { MatchManager } from "./domain/services/match/manager"

export class GameClientModule {
    static async start(listenPort: number) {
        const 
            kafka = new Kafka( "test", gameEnv.BROKER_URL),
            valkey = new Valkey(gameEnv.CACHE_URL),
            websocketCache = new ValkeyWebsocket(valkey.conn),
            matchCache = new ValkeyMatch(valkey.conn),
            connectionManager = 
                new WsConnectionManager(
                    new AccountApi(gameEnv.AUTH_REFRESH_URL, "THIS IS MY API KEY"),
                    websocketCache),
            matchManager = new MatchManager(
                connectionManager.lookUp.bind(connectionManager),
                connectionManager.sendTo.bind(connectionManager))

        const matchService = 
            new MatchService(
                matchCache, 
                websocketCache, 
                new Matchmaker(new HighestWinRate()),
                matchManager)

        const matchController = new MatchmakingController(matchService)

        const matchRouter = new MatchRouter(matchController)
        const appRouter = new GameClientRouterV1( matchRouter)

        // Set up observers, intervals, and stuff
        connectionManager.subscribeOnMessage(appRouter.serve.bind(appRouter))
        connectionManager.subscibeOnClose( 
            async(connectionOwner: number) => {
                await websocketCache.remove(connectionOwner)
                await matchCache.dequeue(connectionOwner)

                const roomId = await matchCache.getCurrentMatchOf(connectionOwner)
                if(roomId)
                    matchManager.checkOut(roomId, connectionOwner)
            }
        )

        const matchmakeInterval = setInterval(async() => {
            await matchController.matchmake(
                connectionManager.sendTo.bind(connectionManager))
        }, 3*1000)

        connectionManager.server.listen(listenPort, () => {
            console.log(`[GameClient] Up and running on ${listenPort}`)
        })
    }
}