import { Message, Response, OnErrorFx, ServeFx } from "_lib/websocket"
import { MatchRouter } from "./match"
import { WsRouter } from "_lib/websocket/ws"
import { GameRouter } from "./game"

export class GameClientRouterV1 extends WsRouter {
    readonly _serveFx: [string, ServeFx][]

    constructor(
        matchRouter: MatchRouter,
        gameRouter: GameRouter
    ) {
        super()
        this._serveFx = [
            ["matchmaking", matchRouter.serve.bind(matchRouter)],
            ["game", gameRouter.serve.bind(gameRouter)]
        ]
    }

    serve(msg: Message, res: Response, onError: OnErrorFx): void {
        const [serveFx, matchLength] = this._resolve(msg.meta.destination, this._serveFx)
        if(!serveFx) {
            res.status("ERR")
                .reason("Destination not found")
                .send()
            return
        }
        msg.meta.destination = msg.meta.destination.slice(matchLength)
        serveFx(msg, res, onError)
    }
}