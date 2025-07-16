import { MatchController } from "gameClient/controller/match";
import { Message, OnErrorFx, Response, ServeFx } from "_lib/Websocket";
import { WsRouter } from "_lib/Websocket/ws";

export class MatchRouter extends WsRouter  {
    private readonly _serveFx: [string, ServeFx][]

    constructor(matchController: MatchController) { 
        super()
        this._serveFx = [
            ["join", matchController.joinPool.bind(matchController)],
            ["leave", matchController.leavePool.bind(matchController)]
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