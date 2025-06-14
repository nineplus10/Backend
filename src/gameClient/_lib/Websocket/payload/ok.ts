export class OkPayload {
    static create(payload: object, meta: object = {}): object {
        return {
            meta: {
                ...meta,
                status: "OK",
            },
            data: {
                ...payload,
            },
        }
    }
}