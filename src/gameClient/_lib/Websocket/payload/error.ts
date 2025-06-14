export class ErrorPayload {
    static create(payload: object, meta: object = {}): object {
        return {
            meta: {
                ...meta,
                status: "ERROR",
            },
            data: {
                ...payload,
            },
        }
    }
}