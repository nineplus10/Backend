import { findRouting, WsRouter, WsServeFx } from ".";
import { MatchController } from "gameClient/controller/match";
import { WebsocketMessage, WebsocketOnError, WebsocketResponse } from "gameClient/_lib/Websocket";

export class MatchRouter implements WsRouter  {
    private readonly _serveFx: [string, WsServeFx][]

    constructor( matchController: MatchController) { 
        this._serveFx = [
            ["join", matchController.joinPool.bind(matchController)],
            ["leave", matchController.leavePool.bind(matchController)]
        ]
    }

    serve(
        payload: WebsocketMessage, 
        res: WebsocketResponse,
        onError: WebsocketOnError
    ): void {
        const [serveFx, matchLength] = findRouting(payload.meta.destination, this._serveFx)
        if(!serveFx) {
            res.status("ERR")
                .reason("Destination not found")
                .send()
            return
        }

        payload.meta.destination = 
            (<string>payload.meta.destination)
            .slice(matchLength)
        serveFx(payload, res, onError)
    }
}