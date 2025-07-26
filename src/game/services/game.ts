import { MatchManager } from "game/domain/services/match/manager";

export class GameService {
    constructor(
        private readonly _matchManager: MatchManager
    ) {

    }

    async join(roomId: string, player: number) {
        await this._matchManager.checkIn(roomId, player)
    }
}