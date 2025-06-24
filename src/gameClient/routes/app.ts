import { MatchController } from "gameClient/controller/match"
import { findRouting, WsRouter, WsServeFx } from "."
import { MatchRouter } from "./match"
import { Message, Response, OnErrorFx } from "gameClient/_lib/Websocket"
import { Valkey } from "_lib/Persistence/Valkey"
import { MatchService } from "gameClient/services/match"
import { ValkeyMatch } from "gameClient/repository/valkey/valkeyMatch"
import { MessageBrokerHandler } from "gameClient/_lib/MessageBroker"
import { HighestWinsMatchmaker } from "gameClient/domain/services/matchmaker/highestWins"

export class GameClientRouterV1 implements WsRouter {
    private constructor(
        private readonly _serveFx: [string, WsServeFx][]
    ) {}

    static async create(
        cacheConn: Valkey["_conn"], 
        msgBroker: MessageBrokerHandler
    ): Promise<GameClientRouterV1> {
        const matchCache = new ValkeyMatch(cacheConn)
    
        const matchService = 
            new MatchService( matchCache, new HighestWinsMatchmaker())

        const matchController = new MatchController(matchService)

        const matchRouter = new MatchRouter(matchController)
        const serveFx: GameClientRouterV1["_serveFx"] = [
            ["match", matchRouter.serve.bind(matchRouter)],
        ]

        // setInterval(async() => {
        //     await matchService.matchmake()
        //         .catch(err => {
        //             console.error(err.message)
        //         })
        // }, 3*1000)
        return new GameClientRouterV1(serveFx)
    }

    serve(msg: Message, res: Response, onError: OnErrorFx): void {
        const destination = msg.meta.destination
        const [matchServeFx, matchLength] = findRouting(destination, this._serveFx)
        if(!matchServeFx) {
            res.status("ERR")
                .reason("Destination not found")
                .send()
            return
        }
        msg.meta.destination = 
            (<string>msg.meta.destination)
            .slice(matchLength)
        matchServeFx( msg, res, onError)
    }
}