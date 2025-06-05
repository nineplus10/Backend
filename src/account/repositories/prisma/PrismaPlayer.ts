import { AuthRecord } from "account/domain/entities/AuthRecord";
import { Player } from "account/domain/Player";
import { AppErr, AppError } from "_lib/Error/AppError";
import { PlayerRepo } from "account/repositories/Player";
import { PrismaClient } from "_lib/_generated/prisma";
import { Session } from "account/domain/entities/Session";
import { Stats } from "account/domain/entities/Stats";
import { Handle } from "account/domain/values/handle";
import { Bio } from "account/domain/values/bio";
import { Email } from "account/domain/values/email";

export class PrismaPlayer implements PlayerRepo {
    async findMany(offset: number, limit: number): Promise<Player[]> {
        const P = new PrismaClient()
        return await P.players
            .findMany({
                include: { stats: true },
                take: limit,
                skip: offset,
            })
            .then(rows => {
                return rows.map(row => {
                    const stats = row.stats!
                    const s = Stats.create({
                        playerId: stats.player_id,
                        gamePlayed: stats.game_played,
                        wins: stats.game_played
                    }, stats.id)

                    return Player.create({
                        password: row.password,
                        username: Handle.create(row.username),
                        bio: Bio.create(row.bio),
                        email: Email.create(row.email),
                        stats: s
                    }, row.id)
                })
            })
    }

    async findByCredentials(username: string, email: string): Promise<Player | undefined> {
        const P = new PrismaClient()
        return await P.players
            .findFirst({
                include: { stats: true },
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

                const stats = row.stats!
                const s = Stats.create({
                    playerId: stats.player_id,
                    gamePlayed: stats.game_played,
                    wins: stats.game_played
                }, stats.id)

                return Player.create({
                    password: row.password,
                    username: Handle.create(row.username),
                    bio: Bio.create(row.bio),
                    email: Email.create(row.email),
                    stats: s
                }, row.id)
            })
    }

    async findById(id: number): Promise<Player | undefined> {
        const P = new PrismaClient()
        return await P.players
            .findFirst({
                include: { stats: true },
                where: {id: id}
            })
            .then(row => {
                if(!row)
                    return undefined

                const stats = row.stats!
                const s = Stats.create({
                    playerId: stats.player_id,
                    gamePlayed: stats.game_played,
                    wins: stats.game_played
                }, stats.id)

                return Player.create({
                    password: row.password,
                    username: Handle.create(row.username),
                    bio: Bio.create(row.bio),
                    email: Email.create(row.email),
                    stats: s
                }, row.id)
            })
    }

    async findByUsername(username: string): Promise<Player | undefined> {
        const P = new PrismaClient()
        return await P.players
            .findFirst({
                include: { stats: true },
                where: {username: username}
            })
            .then(row => {
                if(!row)
                    return undefined

                const stats = row.stats!
                const s = Stats.create({
                    playerId: stats.player_id,
                    gamePlayed: stats.game_played,
                    wins: stats.game_played
                }, stats.id)

                return Player.create({
                    password: row.password,
                    username: Handle.create(row.username),
                    bio: Bio.create(row.bio),
                    email: Email.create(row.email),
                    stats: s
                }, row.id)
            })
    }

    async findByEmail(email: string): Promise<Player | undefined> {
        const P = new PrismaClient()
        return await P.players
            .findFirst({
                include: { stats: true },
                where: {email: email}
            })
            .then(row => {
                if(!row)
                    return undefined

                const stats = row.stats!
                const s = Stats.create({
                    playerId: stats.player_id,
                    gamePlayed: stats.game_played,
                    wins: stats.game_played
                }, stats.id)

                return Player.create({
                    password: row.password,
                    username: Handle.create(row.username),
                    bio: Bio.create(row.bio),
                    email: Email.create(row.email),
                    stats: s
                }, row.id)
            })
    }

    async create(handle: Handle, password: string, email: Email, bio: Bio): Promise<number> {
        const P = new PrismaClient()
        return await P.players
            .create({
                data: {
                    email: email.email,
                    username: handle.name,
                    password: password,
                    bio: bio.content,
                    stats: {
                        create: {
                            game_played: 0,
                            wins: 0,
                        }
                    }
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