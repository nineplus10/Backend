import { findRouting, WsRouter, WsServeFx } from "."
import { Message, Response, OnErrorFx } from "_lib/Websocket"
import { MatchRouter } from "./match"

export class GameClientRouterV1 implements WsRouter {
    readonly _serveFx: [string, WsServeFx][]
    constructor( matchRouter: MatchRouter) {
        this._serveFx = [
            ["match", matchRouter.serve.bind(matchRouter)],
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
        serveFx( msg, res, onError)
    }
}