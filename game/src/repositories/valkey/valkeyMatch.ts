import { Player } from "../../domain/values/player.ts";
import { Valkey } from "@nineplus10/lib/src/persistence/Valkey.ts";
import { Match } from "../../domain/values/match.ts";
import { MatchCache } from "../match.ts";

type Payload  = {
    id: number
    gamePlayed: number
    wins: number
}

export class ValkeyMatch implements MatchCache {
    constructor(
        private readonly _conn: Valkey["_conn"]
    ){}

    async getWaitingPlayers(
        limit: number, 
        order: "ASC" | "DSC" = "ASC"
    ): Promise<Player[]> {
        const key = ["queue", "player"].join(":")
        return await 
            ( order == "ASC" 
                ? this._conn.zrange(key, 0, `${limit}`)
                : this._conn.zrevrange(key, 0, `${limit}`))
            .then(playerKeys => {
                return Promise.all( 
                    playerKeys.map(p => this._conn.hgetall([p, "info"].join(":"))))
            })
            .then(players => {
                return players.map(p => {
                    return Player.create({
                        id: Number(p["id"]),
                        gamePlayed: Number(p["gamePlayed"]),
                        wins: Number(p["wins"])
                    })
                })
            })
    }

    async enqueue(p: Player): Promise<void> {
        const key = ["queue", "player"].join(":")
        const playerKey = [key, `${p.id}`].join(":")
        const playerDataKey = [playerKey, "info"].join(":")

        const payload: Payload = {
            id: p.id,
            gamePlayed: p.gamePlayed,
            wins: p.wins
        }

        await this._conn
            .multi()
            .zadd(key, Date.now(), playerKey)
            .hset(playerDataKey, payload)
            .exec((err, _) => {
                if(err)
                    console.error(err)
            })
    }

    async dequeue(...playerId: number[]): Promise<void> {
        if(playerId.length == 0) return 

        const key = ["queue", "player"].join(":")
        const playerKey = playerId.map(pId => [key, `${pId}`].join(":"))
        const playerDataKey = playerKey.map(pk => [pk, "info"].join(":"))

        await this._conn
            .multi()
            .zrem(key, ...playerKey)
            .del(...playerDataKey)
            .exec((err, _) => {
                if(err)
                    console.error(err)
            })
    }

    async getCurrentMatchOf(playerId: number): Promise<string | undefined> {
        const key = ["player", `${playerId}`, "match"].join(":")
        const row = await this._conn.get(key)
        return row ?? undefined
    }

    async saveOngoingMatch(identifiers: string[], matches: Match[]): Promise<void> {
        const args: string[] = []
        matches.forEach((m, idx) => {
            const p1Key = ["player", m.player1.id, "match"].join(":")
            const p2Key = ["player", m.player2.id, "match"].join(":")
            args.push(p1Key, identifiers[idx])
            args.push(p2Key, identifiers[idx])
        })
        await this._conn.mset(...args)
    }

    async deleteCompletedMatch(matches: Match[]): Promise<void> {
        const args: string[] = []
        matches.forEach(m => {
            const p1Key = ["player", m.player1.id, "match"].join(":")
            const p2Key = ["player", m.player2.id, "match"].join(":")
            args.push(p1Key, p2Key)
        })
        await this._conn.del(...args)
    }
}