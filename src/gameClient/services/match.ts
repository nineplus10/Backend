import { Player } from "gameClient/domain/entities/player";
import { MatchCache } from "gameClient/repository/match";
import { Matchmaker } from "../domain/services/matchmaker";
import { Match } from "gameClient/domain/match";

const attemptSkipCap = 10

export class MatchService {
    private _attemptSkipped: number
    constructor(
        private readonly _matchCache: MatchCache,
        private readonly _matchMaker: Matchmaker
    ) { 
        this._attemptSkipped = 0
    }

    async joinPool(playerId: number, gamePlayed: number, wins: number): Promise<void> {
        const player = Player.create({
            gamePlayed: gamePlayed, 
            wins: wins
        }, playerId)
        await this._matchCache.enqueue(player)
    }

    async leavePool(playerId: number): Promise<void> {
        await this._matchCache.dequeue(playerId)
    }

    async matchmake(): Promise<Match[]> {
        const 
            reducerCoef = 1 / (this._attemptSkipped + 1),
            N_MINIMUM_PLAYER_PER_BATCH = 
                this._attemptSkipped == attemptSkipCap
                    ? 2
                    : Math.floor(50 * reducerCoef),
            N_MAX_PLAYER_PER_BATCH = 1000

        return await this._matchCache
            .getWaitingPlayers(N_MAX_PLAYER_PER_BATCH)
            .then(players => {
                if(players.length < N_MINIMUM_PLAYER_PER_BATCH) {
                    if(this._attemptSkipped < attemptSkipCap) {
                        this._attemptSkipped++
                    }
                    return []
                }                     

                this._attemptSkipped = 0
                const endIdx = Math.floor(players.length / 2) * 2
                const matches = this._matchMaker.do(players.slice(0, endIdx))
                return matches
            })
    }
}