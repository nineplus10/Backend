import { MatchController } from "gameClient/controller/match"
import { findRouting, WsRouter, WsServeFx } from "."
import { MatchRouter } from "./match"
import { WebsocketMessage, WebsocketResponse, WebsocketOnError } from "gameClient/_lib/Websocket"
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

    serve(
        payload: WebsocketMessage, 
        res: WebsocketResponse,
        onError: WebsocketOnError
    ): void {
        const destination = payload.meta.destination
        const [matchServeFx, matchLength] = findRouting(destination, this.serveFx)
        if(!matchServeFx) {
            res.status("ERR")
                .reason("Destination not found")
                .send()
            return
        }
        payload.meta.destination = 
            (<string>payload.meta.destination)
            .slice(matchLength)
        matchServeFx( payload, res, onError)
    }
}