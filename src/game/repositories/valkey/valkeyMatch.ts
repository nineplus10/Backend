import { MatchCache } from "../match";
import valkey from "iovalkey";
import { PlayerStats } from "game/domain/values/playerStats";

type Payload  = {
    playerId: number
    gamePlayed: number
    wins: number
}

export class ValkeyMatch implements MatchCache {
    constructor(
        private readonly _conn: valkey
    ){}

    async getWaitingPlayers(
        limit: number, 
        order: "ASC" | "DSC" = "ASC"
    ): Promise<PlayerStats[]> {
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
                    return PlayerStats.create({
                        playerId: Number(p["playerId"]),
                        gamePlayed: Number(p["gamePlayed"]),
                        wins: Number(p["wins"])
                    })
                })
            })
    }

    async enqueue(p: PlayerStats): Promise<void> {
        const key = ["queue", "player"].join(":")
        const playerKey = [key, `${p.playerId}`].join(":")
        const playerDataKey = [playerKey, "info"].join(":")

        const payload: Payload = {
            playerId: p.playerId,
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
}