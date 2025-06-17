import { Match } from "gameClient/domain/match";
import { MatchCache } from "../match";
import valkey from "iovalkey";
import { Player } from "gameClient/domain/entities/player";

export class ValkeyMatch implements MatchCache {
    constructor(
        private readonly _conn: valkey
    ){}

    async getMany(
        limit: number, 
        order: "ASC" | "DSC" = "ASC"
    ): Promise<Match[]> {
        const key = ["player", "pool"].join(":")
        const players = await (
            order == "ASC" 
                ? this._conn.zrange(key, 0, `${limit}`)
                : this._conn.zrevrange(key, 0, `${limit}`)
        )
        console.log(players)
        return []
    }

    async addPlayer(p: Player): Promise<void> {
        const key = ["player", "pool"].join(":")
        await this._conn.zadd(key, Date.now(), p.id!)
    }

    async removePlayer(p: Player): Promise<void> {
        const key = ["player", "pool"].join(":")
        await this._conn.zrem(key, p.id!)
    }
}