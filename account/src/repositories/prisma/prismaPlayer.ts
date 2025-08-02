import { PrismaClient } from "@nineplus10/lib/src/_generated/prisma";
import { PlayerRepo } from "../player.js";
import { Player } from "../../domain/player.js";
import { Stats } from "../../domain/entities/stats.js";
import { Handle } from "../../domain/values/handle.js";
import { Bio } from "../../domain/values/bio.js";
import { Email } from "../../domain/values/email.js";
import { AuthRecord } from "../../domain/entities/authRecord.js";

export class PrismaPlayer implements PlayerRepo {
    async findMany(offset: number, limit: number): Promise<Player[]> {
        const P = new PrismaClient()
        const rows = await P.players.findMany({
            include: { stats: true },
            take: limit,
            skip: offset,
        })

        return rows.map(row => {
            const 
                stats = row.stats!,
                s = Stats.create({
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

    async findByCredentials(username: string, email: string): Promise<Player | undefined> {
        const P = new PrismaClient()
        const row = await P.players .findFirst({
            include: { stats: true },
            where: {
                OR: [
                    { username: username },
                    { email: email }
                ]
            }
        })
        if(!row) 
            return undefined

        const 
            stats = row.stats!,
            s = Stats.create({
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
    }

    async findById(id: number): Promise<Player | undefined> {
        const P = new PrismaClient()
        const row =  await P.players
            .findFirst({
                include: { stats: true },
                where: {id: id}
            })
        if(!row) 
            return undefined

        const 
            stats = row.stats!,
            s = Stats.create({
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
    }

    async findByUsername(username: string): Promise<Player | undefined> {
        const P = new PrismaClient()
        const row =  await P.players
        .findFirst({
            include: { stats: true },
            where: {username: username}
        })
        if(!row)
            return undefined

        const 
            stats = row.stats!,
            s = Stats.create({
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
    }

    async findByEmail(email: string): Promise<Player | undefined> {
        const P = new PrismaClient()
        const row = await P.players
        .findFirst({
            include: { stats: true },
            where: {email: email}
        })
        if(!row)
            return undefined

        const 
            stats = row.stats!,
            s = Stats.create({
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
    }

    async create(handle: Handle, password: string, email: Email, bio: Bio): Promise<number> {
        const P = new PrismaClient()
        const row = await P.players .create({
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
        return row.id
    }   

    async update(p: Player): Promise<void> {
        const P = new PrismaClient()
        await P.players .update({
            where: {id: p.id!},
            data: {
                bio: p.bio.content,
            }
        })
    }

    ////////////////////////////////
    // Auth Record
    // TODO: consider moving it to cache instead
    ////////////////////////////////
    async findLastNAttempt(playerId: number, n: number): Promise<AuthRecord[]> {
        const P = new PrismaClient()
        const rows = await P.auth_records .findMany({
            where: {player_id: playerId},
            orderBy: { attempted_at: "desc" },
            take: n,
        })

        return rows.map(r => {
            return AuthRecord.create({
                playerId: r.player_id,
                attemptedAt: r.attempted_at,
                origin: r.origin,
                isOk: r.is_ok
            }, r.id)
        })
    }

    async findLastNAttemptByOrigin( origin: string, n: number): Promise<AuthRecord[]> {
        const P = new PrismaClient()
        const rows =  await P.auth_records.findMany({
            where: {origin: origin},
            orderBy: { attempted_at: "desc" },
            take: n,
        })

        return rows.map(r => {
            return AuthRecord.create({
                playerId: r.player_id,
                attemptedAt: r.attempted_at,
                origin: r.origin,
                isOk: r.is_ok
            }, r.id)
        })
    }

    async addAuthAttempt(a: AuthRecord): Promise<number> {
        const P = new PrismaClient()
        const row = await P.auth_records .create({
            data: {
                player_id: a.playerId,
                origin: a.origin,
                is_ok: a.isOk,
                attempted_at: a.attemptedAt,
            }
        })

        return row.id
    }
}