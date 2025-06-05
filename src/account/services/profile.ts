import { AppErr, AppError } from "_lib/Error/AppError";
import { Player } from "account/domain/player";
import { PlayerRepo } from "account/repositories/player";

export class ProfileService {
    constructor(
        private readonly _playerRepo: PlayerRepo
    ) {}

    async getSelf(id: number): Promise<Player> {
        return await this._playerRepo
            .findById(id)
            .then(p => {
                if(!p)
                    throw new AppError(
                        AppErr.NotFound,
                        "Player not found")
                return p
            })
    }
}