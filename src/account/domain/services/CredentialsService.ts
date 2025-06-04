import { PlayerRepo } from "account/repositories/Player";

export class CredentialsService {
    static async getCredentialAvailability(
        userRepo: PlayerRepo, 
        username: string, 
        email: string
    ): Promise<boolean> {
        return await userRepo
            .findByCredentials(username, email)
            .then(p => p === undefined)
    }
}