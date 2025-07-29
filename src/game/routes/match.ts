import { MatchmakingController } from "game/controllers/match";
import { Message, OnErrorFx, Response, ServeFx } from "_lib/websocket";
import { WsRouter } from "_lib/websocket/ws";

export class MatchRouter extends WsRouter  {
    private readonly _serveFx: [string, ServeFx][]

    constructor(controller: MatchmakingController) { 
        super()
        this._serveFx = [
            ["play", controller.joinPool.bind(controller)],
            ["quit", controller.leavePool.bind(controller)],
            ["join", controller.joinMatch.bind(controller)],
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