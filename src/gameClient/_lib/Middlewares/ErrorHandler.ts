import { ErrorPayload } from "../Websocket/payload/error";

export class ErrorHandler {
    static composePayload(error: Error): ErrorPayload {
        return ErrorPayload.create(error.message)
    }
}