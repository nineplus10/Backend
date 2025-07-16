import { Player } from "account/domain/player";
import { Repository } from "../../_lib/domain/repository";
import { AuthRecord } from "account/domain/entities/authRecord";
import { Handle } from "account/domain/values/handle";
import { Email } from "account/domain/values/email";
import { Bio } from "account/domain/values/bio";
import { Session } from "account/domain/entities/session";

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