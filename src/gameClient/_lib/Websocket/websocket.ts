import { ErrorPayload } from "./payload/error";
import { OkPayload } from "./payload/ok";

export interface WsRouter {
    serve(data: any): OkPayload | ErrorPayload
}