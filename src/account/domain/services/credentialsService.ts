import { PlayerRepo } from "account/repositories/player";

export class CredentialsService {
    static async getCredentialAvailability(
        userRepo: PlayerRepo, 
        username: string, 
        email: string
    ): Promise<boolean> {
        const playerWithCredential = await userRepo.findByCredentials(username, email)
        return playerWithCredential === undefined
    }
}