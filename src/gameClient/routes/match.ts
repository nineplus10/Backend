import { WsResponse } from "gameClient/controller/response";
import { findRouting, WsRouter, WsServeFx } from ".";
import { MatchController } from "gameClient/controller/match";
import { WsMessage } from "gameClient/_lib/Websocket/ws";

export class MatchRouter implements WsRouter  {
    private readonly _serveFx: [string, WsServeFx][]

    constructor(
        readonly controller: MatchController
    ) { 
        this._serveFx = [
            ["join", controller.joinPool.bind(controller)],
            ["leave", controller.leavePool.bind(controller)]
        ]
    }

    serve(payload: WsMessage, res: WsResponse): void {
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
        serveFx(payload, res)
    }
}