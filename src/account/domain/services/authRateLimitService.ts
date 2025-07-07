import { accountEnv } from "account/env";
import { PlayerRepo } from "account/repositories/player";

const AUTH_MAX_FAIL = accountEnv.AUTH_MAX_FAIL

export class AuthRateLimitService {
    static async calculateOriginBackoff(
        playerRepo: PlayerRepo,
        origin: string
    ): Promise<number> {
        const 
            attempt = await playerRepo.findLastNAttemptByOrigin(origin, AUTH_MAX_FAIL),
            hasFailedLately = (
                attempt.length == AUTH_MAX_FAIL
                && attempt.every(a => !a.isOk && a.getCooldown() > 0)
            )

        return hasFailedLately? attempt[0].getCooldown() : 0
    }

    static async calculateAccountBackoff(
        playerRepo: PlayerRepo,
        playerId: number
    ): Promise<number> {
        const 
            attempt = await playerRepo.findLastNAttempt(playerId, AUTH_MAX_FAIL),
            hasFailedLately = (
                attempt.length == AUTH_MAX_FAIL
                && attempt.every(a => !a.isOk && a.getCooldown() > 0)
            )

        return hasFailedLately? attempt[0].getCooldown() : 0
    }
}