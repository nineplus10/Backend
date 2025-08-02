import { Message, OnErrorFx, Response, ServeFx } from "@nineplus10/lib/src/websocket/index.ts"
import { WsRouter } from "@nineplus10/lib/src/websocket/ws.js"
import { MatchRouter } from "./match.ts"

export class GameClientRouterV1 extends WsRouter {
    readonly _serveFx: [string, ServeFx][]

    constructor(
        router: MatchRouter,
    ) {
        super()
        this._serveFx = [
            ["match", router.serve.bind(router)],
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