import { gEnv } from "env";
import { PlayerRepo } from "account/repositories/player";

const AUTH_MAX_FAIL = gEnv.AUTH_MAX_FAIL

export class AuthRateLimitService {
    static async calculateOriginBackoff(
        playerRepo: PlayerRepo,
        origin: string
    ): Promise<number> {
        return await playerRepo
            .findLastNAttemptByOrigin(origin, AUTH_MAX_FAIL)
            .then(a => {
                const hasFailedLately = (
                    a.length == AUTH_MAX_FAIL
                    && a.every(a => !a.isOk && a.getCooldown() > 0)
                )
                return hasFailedLately? a[0].getCooldown() : 0
            })
    }

    static async calculateAccountBackoff(
        playerRepo: PlayerRepo,
        playerId: number
    ): Promise<number> {
        return await playerRepo
            .findLastNAttempt(playerId, AUTH_MAX_FAIL)
            .then(a => {
                const hasFailedLately = (
                    a.length == AUTH_MAX_FAIL
                    && a.every(a => !a.isOk && a.getCooldown() > 0)
                )
                return hasFailedLately? a[0].getCooldown() : 0
            })
    }
}