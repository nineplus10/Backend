import { Player } from "account/domain/Player";
import { Repository } from "../../_lib/Domain/_Repository";
import { AuthRecord } from "account/domain/entities/AuthRecord";
import { Session } from "account/domain/entities/Session";

export interface PlayerRepo extends Repository<Player> {
    create(p: Player): Promise<number>;
    update(p: Player): Promise<void>;

    findByCredentials(username: string, email: string): Promise<Player | undefined>;
    findByUsername(username: string): Promise<Player | undefined>
    findByEmail(email: string): Promise<Player | undefined>
    findById(id: number): Promise<Player | undefined>

    // AuthRecord
    addAuthAttempt(a: AuthRecord): Promise<number>;
    findLastNAttempt(userId: number, n: number): Promise<AuthRecord[]>
    findLastNAttemptByOrigin( origin: string, n: number): Promise<AuthRecord[]>

    // Session
    initiateSession(s: Session): Promise<void>
    checkSession(sessionToken: string): Promise<Session | undefined>
}