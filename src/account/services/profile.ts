import { AppErr, AppError } from "_lib/Error/AppError";
import { Player } from "account/domain/player";
import { Bio } from "account/domain/values/bio";
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

    async update(id: number, bio: string): Promise<Player> {
        let p: Player
        return await this._playerRepo
            .findById(id)
            .then(oldP => {
                if(!oldP)
                    throw new AppError(
                        AppErr.NotFound,
                        "Player not found")

                p = oldP
                p.bio = Bio.create(bio)
                return this._playerRepo.update(p)
            })
            .then(_ => p)
    }
}