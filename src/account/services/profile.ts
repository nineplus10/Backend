import { AppErr, AppError } from "_lib/error/application";
import { Player } from "account/domain/player";
import { Bio } from "account/domain/values/bio";
import { PlayerRepo } from "account/repositories/player";

export class ProfileService {
    constructor(
        private readonly _playerRepo: PlayerRepo
    ) {}

    async getSelf(id: number): Promise<Player> {
        const player = await this._playerRepo.findById(id)
        if(!player)
            throw new AppError(
                AppErr.NotFound,
                "Player not found")
        return player
    }

    async update(id: number, bio: string): Promise<Player> {
        const player = await this._playerRepo.findById(id)
        if(!player)
            throw new AppError(
                AppErr.NotFound,
                "Player not found")

        player.bio = Bio.create(bio)
        await this._playerRepo.update(player)

        return player
    }
}