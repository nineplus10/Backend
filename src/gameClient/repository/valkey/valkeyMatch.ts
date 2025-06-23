import { MatchCache } from "../match";
import valkey from "iovalkey";
import { Player } from "gameClient/domain/entities/player";

export class ValkeyMatch implements MatchCache {
    constructor(
        private readonly _conn: valkey
    ){}

    async getWaitingPlayers(
        limit: number, 
        order: "ASC" | "DSC" = "ASC"
    ): Promise<Player[]> {
        const key = ["player", "pool"].join(":")
        const players = await (
            order == "ASC" 
                ? this._conn.zrange(key, 0, `${limit}`)
                : this._conn.zrevrange(key, 0, `${limit}`)
        )
        return []
    }

    async enqueue(p: Player): Promise<void> {
        const key = ["player", "pool"].join(":")
        await this._conn.zadd(key, Date.now(), p.id!)
    }

    async dequeue(playerId: number): Promise<void> {
        const key = ["player", "pool"].join(":")
        await this._conn.zrem(key, playerId)
    }
}