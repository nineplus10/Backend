import { Player } from "gameClient/domain/entities/player";
import { MatchCache } from "gameClient/repository/match";

export class MatchService {
    constructor(
        private readonly _matchCache: MatchCache
    ) { }

    async joinPool(playerId: number, gamePlayed: number, wins: number) {
        const player = Player.create({
            gamePlayed: gamePlayed, 
            wins: wins
        }, playerId)
        await this._matchCache.addPlayer(player)
    }

    async leavePool(playerId: number) {
        const player = Player.create({
            gamePlayed: 0, 
            wins: 0
        }, playerId)
        await this._matchCache.removePlayer(player)
    }
}