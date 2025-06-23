import { Player } from "gameClient/domain/entities/player";
import { MatchCache } from "gameClient/repository/match";

export class MatchService {
    constructor(
        private readonly _matchCache: MatchCache
    ) { }

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

}