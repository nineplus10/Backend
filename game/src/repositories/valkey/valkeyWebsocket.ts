import { Valkey } from "@nineplus10/lib/src/persistence/Valkey.ts";
import { Cache } from "@nineplus10/lib/src/websocket/index.ts";

export class ValkeyWebsocket implements Cache {
    constructor(
        private readonly _conn: Valkey["_conn"]
    ) {}

    private connectionKey(playerId: number): string {
        return ["player", "connection", `${playerId}`].join(":")
    }

    async find(
        ...playerId: number[]
    ): Promise<(string | undefined)[]> {
        if(playerId.length == 0) return []

        const keys = playerId.map(pId => this.connectionKey(pId))
        return await this._conn
            .mget(...keys)
            .then(connectionId => {
                return connectionId.map(cId => {
                    return cId ?? undefined
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