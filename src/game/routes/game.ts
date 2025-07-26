import { Message, OnErrorFx, Response, ServeFx } from "_lib/websocket";
import { WsRouter } from "_lib/websocket/ws";
import { GameController } from "game/controllers/game";

export class GameRouter extends WsRouter {
    private readonly _serveFx: [string, ServeFx][]

    constructor(gameController: GameController) { 
        super()
        this._serveFx = [
            ["join", gameController.join.bind(gameController)],
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