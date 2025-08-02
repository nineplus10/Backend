import { Kafka } from "@nineplus10/lib/src/messageBroker/kafka.ts"
import { gameEnv } from "./env.ts"
import { Valkey } from "@nineplus10/lib/src/persistence/Valkey.ts"
import { ValkeyWebsocket } from "./repositories/valkey/valkeyWebsocket.ts"
import { ValkeyMatch } from "./repositories/valkey/valkeyMatch.ts"
import { WsConnectionManager } from "@nineplus10/lib/src/websocket/ws.ts"
import { AccountApi } from "@nineplus10/lib/src/external/account.ts"
import { MatchManager } from "./domain/services/match/manager.ts"
import { MatchService } from "./services/match.ts"
import { Matchmaker } from "./domain/services/matchmaking/matchmaker.ts"
import { HighestWinRate } from "./domain/services/matchmaking/strategies/highestWinRate.ts"
import { MatchmakingController } from "./controllers/match.ts"
import { MatchRouter } from "./routes/match.ts"
import { GameClientRouterV1 } from "./routes/index.ts"

export class GameClientModule {
    static async start(listenPort: number) {
        const 
            kafka = new Kafka("test", gameEnv.BROKER_URL),
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
                    matchManager.checkOut(connectionOwner, roomId)
            }
        )

        const matchmakeInterval = setInterval(async() => {
            await matchController.matchmake(
                connectionManager.sendTo.bind(connectionManager))
        }, 3*1000)

        connectionManager.server.listen(listenPort, () => {
            console.log(`Up and running on ${listenPort}`)
        })
    }
}

GameClientModule.start(gameEnv.APP_PORT)