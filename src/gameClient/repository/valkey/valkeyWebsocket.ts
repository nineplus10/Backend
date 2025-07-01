import { randomUUID } from "crypto";
import { WebsocketCache } from "../websocket";
import valkey from "iovalkey";

export class ValkeyWebsocket implements WebsocketCache {
    constructor(
        private readonly _conn: valkey
    ) {}

    private connectionKey(playerId: number): string {
        return ["player", "connection", `${playerId}`].join(":")
    }

    async find(
        ...playerId: number[]
    ): Promise<(ReturnType<typeof randomUUID> | undefined)[]> {
        if(playerId.length == 0) return []

        const keys = playerId.map(pId => this.connectionKey(pId))
        return await this._conn
            .mget(...keys)
            .then(connectionId => {
                return connectionId.map(cId => {
                    return <ReturnType<typeof randomUUID>>cId ?? undefined
                })
            })
    }

    async save(playerId: number, connectionId: string): Promise<void> {
        const key = this.connectionKey(playerId)
        await this._conn.set(key, connectionId)
    }

    async remove(playerId: number): Promise<void> {
        const key = this.connectionKey(playerId)
        await this._conn.del(key)
    }
}