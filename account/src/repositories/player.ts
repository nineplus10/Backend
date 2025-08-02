import { Repository } from "@nineplus10/lib/src/domain/repository.js";
import { Player } from "../domain/player.js";
import { Handle } from "../domain/values/handle.js";
import { Email } from "../domain/values/email.js";
import { Bio } from "../domain/values/bio.js";
import { AuthRecord } from "../domain/entities/authRecord.js";
import { Session } from "../domain/entities/session.js";

export interface PlayerRepo extends Repository<Player> {
    create(
        handle: Handle,
        password: string,
        email: Email,
        bio: Bio
    ): Promise<number>;
    update(p: Player): Promise<void>;

    findByCredentials(username: string, email: string): Promise<Player | undefined>;
    findByUsername(username: string): Promise<Player | undefined>
    findByEmail(email: string): Promise<Player | undefined>
    findById(id: number): Promise<Player | undefined>

    // AuthRecord
    addAuthAttempt(a: AuthRecord): Promise<number>;
    findLastNAttempt(userId: number, n: number): Promise<AuthRecord[]>
    findLastNAttemptByOrigin( origin: string, n: number): Promise<AuthRecord[]>
}

export interface SessionCache {
    create(s: Session): Promise<void>
    find(
        playerId: Session["playerId"],
        userAgent: Session["userAgent"],
        _?: Session["origin"]
    ): Promise<Session | undefined>
    revoke(
        playerId: number, 
        userAgent: Session["userAgent"],
        _?: Session["origin"]
    ): Promise<void>
}