type ResponseMetaT = {
    status: "OK" | "ERR"
    reason?: string
}

export class WsResponse {
    private readonly _meta : ResponseMetaT 

    constructor(
        private readonly _sendFx: (payload: any) => void
    ) {
        this._meta = {
            status: "OK"
        }
    }

    send(payload?: any) {
        this._sendFx(JSON.stringify({
            meta: this._meta,
            data: payload}
        ))
    }

    status(s: WsResponse["_meta"]["status"]): WsResponse {
        this._meta.status = s; return this
    }
    reason(r: WsResponse["_meta"]["reason"]): WsResponse {
        this._meta.reason = r; return this
    }
}