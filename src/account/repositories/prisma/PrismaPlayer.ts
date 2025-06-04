import { AuthRecord } from "account/domain/entities/AuthRecord";
import { Player } from "account/domain/Player";
import { AppErr, AppError } from "_lib/Error/AppError";
import { PlayerRepo } from "account/repositories/Player";
import { PrismaClient } from "_lib/_generated/prisma";
import { Session } from "account/domain/entities/Session";

export class PrismaPlayer implements PlayerRepo {
    async findMany(offset: number, limit: number): Promise<Player[]> {
        const P = new PrismaClient()
        return await P.players
            .findMany({
                take: limit,
                skip: offset
            })
            .then(rows => {
                return rows.map(r => {
                    return Player.create({
                        password: r.password,
                        username: r.username,
                        bio: r.bio,
                        email: r.email
                    }, r.id)
                })
            })
    }

    async findByCredentials(username: string, email: string): Promise<Player | undefined> {
        const P = new PrismaClient()
        return await P.players
            .findFirst({
                where: {
                    OR: [
                        { username: username },
                        { email: email }
                    ]
                }
            })
            .then(row => {
                if(!row)
                    return undefined

                return Player.create({
                    username: row.username,
                    password: row.password,
                    bio: row.bio,
                    email: row.email,
                }, row.id)
            })
    }

    async findById(id: number): Promise<Player | undefined> {
        const P = new PrismaClient()
        return await P.players
            .findFirst({
                where: {id: id}
            })
            .then(row => {
                if(!row)
                    return undefined

                return Player.create({
                    username: row.username,
                    password: row.password,
                    bio: row.bio,
                    email: row.email,
                }, row.id)
            })
    }

    async findByUsername(username: string): Promise<Player | undefined> {
        const P = new PrismaClient()
        return await P.players
            .findFirst({
                where: {username: username}
            })
            .then(row => {
                if(!row)
                    return undefined

                return Player.create({
                    username: row.username,
                    password: row.password,
                    bio: row.bio,
                    email: row.email,
                }, row.id)
            })
    }

    async findByEmail(email: string): Promise<Player | undefined> {
        const P = new PrismaClient()
        return await P.players
            .findFirst({
                where: {email: email}
            })
            .then(row => {
                if(!row)
                    return undefined

                return Player.create({
                    username: row.username,
                    password: row.password,
                    bio: row.bio,
                    email: row.email,
                }, row.id)
            })
    }

    async create(p: Player): Promise<number> {
        const P = new PrismaClient()
        return await P.players
            .create({
                data: {
                    email: p.email,
                    username: p.username,
                    password: p.password,
                    bio: p.bio
                }
            })
            .then(row => row.id)
    }   

    async update(p: Player): Promise<void> {
        throw new AppError( AppErr.NotImplemented, "PrismaPlayer<update>")
    }

    ////////////////////////////////
    // Auth Record
    ////////////////////////////////
    async findLastNAttempt(playerId: number, n: number): Promise<AuthRecord[]> {
        const P = new PrismaClient()
        return await P.auth_records
            .findMany({
                where: {player_id: playerId},
                orderBy: { attempted_at: "desc" },
                take: n,
            })
            .then(rows => (
                rows.map(r => {
                    return AuthRecord.create({
                        playerId: r.player_id,
                        attemptedAt: r.attempted_at,
                        origin: r.origin,
                        isOk: r.is_ok
                    }, r.id)
                })
            ))
    }

    async findLastNAttemptByOrigin( origin: string, n: number): Promise<AuthRecord[]> {
        const P = new PrismaClient()
        return await P.auth_records
            .findMany({
                where: {origin: origin},
                orderBy: { attempted_at: "desc" },
                take: n,
            })
            .then(rows => (
                rows.map(r => {
                    return AuthRecord.create({
                        playerId: r.player_id,
                        attemptedAt: r.attempted_at,
                        origin: r.origin,
                        isOk: r.is_ok
                    }, r.id)
                })
            ))
    }

    // TODO: consider moving it to cache instead
    async addAuthAttempt(a: AuthRecord): Promise<number> {
        const P = new PrismaClient()
        return await P.auth_records
            .create({
                data: {
                    player_id: a.playerId,
                    origin: a.origin,
                    is_ok: a.isOk,
                    attempted_at: a.attemptedAt,
                }
            })
            .then(row => row.id)
    }

    ////////////////////////////////
    // Sessions
    ////////////////////////////////
    async checkSession(token: string): Promise<Session | undefined> {
        const P = new PrismaClient()
        return await P.sessions
            .findFirst({
                where: {token: token},
                orderBy: { issued_at: "desc" }
            })
            .then(row => {
                if(!row)
                    return undefined

                return Session.create({
                    playerId: row.player_id,
                    origin: row.origin,
                    userAgent: row.user_agent,
                    token: row.token,
                    issuedAt: row.issued_at,
                    revokedAt: row.revoked_at ?? undefined
                })
            })
    }

    async initiateSession(s: Session): Promise<void> {
        const P = new PrismaClient()
        await P.sessions
            .create({
                data: {
                    player_id: s.playerId,
                    origin: s.origin,
                    user_agent: s.userAgent,
                    token: s.token,
                    issued_at: s.issuedAt,
                    revoked_at: s.revokedAt
                }
            })
    }
}