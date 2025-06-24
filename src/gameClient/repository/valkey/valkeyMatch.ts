import { MatchCache } from "../match";
import valkey from "iovalkey";
import { Player } from "gameClient/domain/entities/player";
import { AppErr, AppError } from "_lib/Error/AppError";

type Payload  = {
    id: number
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
                        gamePlayed: Number(p["gamePlayed"]),
                        wins: Number(p["wins"])
                    }, Number(p["id"]))
                })
            })
    }

    async enqueue(p: Player): Promise<void> {
        const key = ["queue", "player"].join(":")
        const playerKey = [key, `${p.id!}`].join(":")
        const playerDataKey = [playerKey, "info"].join(":")

        const payload: Payload = {
            id: p.id!,
            gamePlayed: p.gamePlayed,
            wins: p.wins
        }

        await this._conn
            .multi()
            .zadd(key, Date.now(), playerKey)
            .hset(playerDataKey, payload)
            .exec((err, _) => {
                if(err)
                    throw new AppError(
                        AppErr.DBInternal,
                        "Something went wrong in `ValkeyMatch<enqueue>")
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
                    throw new AppError(
                        AppErr.DBInternal,
                        "Something went wrong in `ValkeyMatch<enqueue>")
            })
    }
}