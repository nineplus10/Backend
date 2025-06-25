import { findRouting, WsRouter, WsServeFx } from ".";
import { MatchController } from "gameClient/controller/match";
import { Message, OnErrorFx, Response } from "_lib/Websocket";

export class MatchRouter implements WsRouter  {
    private readonly _serveFx: [string, WsServeFx][]

    constructor( matchController: MatchController) { 
        this._serveFx = [
            ["join", matchController.joinPool.bind(matchController)],
            ["leave", matchController.leavePool.bind(matchController)]
        ]
    }

    serve(msg: Message, res: Response, onError: OnErrorFx): void {
        const [serveFx, matchLength] = findRouting(msg.meta.destination, this._serveFx)
        if(!serveFx) {
            res.status("ERR")
                .reason("Destination not found")
                .send()
            return
        }

        msg.meta.destination = 
            (<string>msg.meta.destination)
            .slice(matchLength)
        serveFx(msg, res, onError)
    }
}