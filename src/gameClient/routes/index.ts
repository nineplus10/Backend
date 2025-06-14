import { ErrorPayload } from "gameClient/_lib/Websocket/payload/error";
import { OkPayload } from "gameClient/_lib/Websocket/payload/ok";
import { WsRouter } from "gameClient/_lib/Websocket/websocket";

export class GameClientRouterV1 implements WsRouter {
    constructor() { }

    serve(data: any): OkPayload | ErrorPayload {
        let payload;
        try {
            payload = <object>JSON.parse(data.toString())
        } catch(SyntaxError) {
            return ErrorPayload.create({})
        }

        return payload
    }
}