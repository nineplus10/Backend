import { MatchController } from "gameClient/controller/match"
import { findRouting, WsRouter, WsServeFx } from "."
import { MatchRouter } from "./match"
import { Message, Response, OnErrorFx } from "gameClient/_lib/Websocket"
import { Valkey } from "_lib/Persistence/Valkey"
import { MatchService } from "gameClient/services/match"
import { ValkeyMatch } from "gameClient/repository/valkey/valkeyMatch"

export class GameClientRouterV1 implements WsRouter {
    private serveFx: [string, WsServeFx][]

    constructor(cacheConn: Valkey, brokerConn: unknown) {
        const matchCache = new ValkeyMatch(cacheConn.conn)
    
        const matchService = new MatchService(matchCache)

        const matchController = new MatchController(matchService)

        const matchRouter = new MatchRouter(matchController)
        this.serveFx = [
            ["match", matchRouter.serve.bind(matchRouter)]
        ]
    }

    serve(msg: Message, res: Response, onError: OnErrorFx): void {
        const destination = msg.meta.destination
        const [matchServeFx, matchLength] = findRouting(destination, this.serveFx)
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