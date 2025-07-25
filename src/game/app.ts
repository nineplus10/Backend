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
import { Matchmaker } from "./domain/services/matchmaker"
// import { MatchManager } from "./domain/services/match/manager"
// import { GameService } from "./services/game"
// import { GameController } from "./controllers/game"
// import { GameRouter } from "./routes/game"

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
                    websocketCache)
            // matchManager = new MatchManager((connectionName: string, payload: object) => {
            //     connectionManager.sendTo(connectionName, payload)
            // })

    
        const matchService = 
            new MatchService(
                matchCache, 
                websocketCache, 
                new Matchmaker(new HighestWinRate()))
        // const gameService = new GameService(matchManager)

        // const gameController = new GameController(gameService)
        const matchController = new MatchController(matchService)

        // const gameRouter = new GameRouter(gameController)
        const matchRouter = new MatchRouter(matchController)

        const appRouter = new GameClientRouterV1(matchRouter)

        // Set up callbacks, intervals, and stuff
        connectionManager.subscribeOnMessage(appRouter.serve.bind(appRouter))
        connectionManager.subscibeOnClose( 
            async(connectionOwner: number) => {
                await websocketCache.remove(connectionOwner)
                await matchCache.dequeue(connectionOwner)
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