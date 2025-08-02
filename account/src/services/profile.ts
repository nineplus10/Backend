import { AppErr, AppError } from "@nineplus10/lib/src/error/application.js"
import { Player } from "../domain/player.js"
import { PlayerRepo } from "../repositories/player.js"
import { Bio } from "../domain/values/bio.js"

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