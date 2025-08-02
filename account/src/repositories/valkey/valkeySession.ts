import { Valkey } from "@nineplus10/lib/src/persistence/Valkey.ts";
import { SessionCache } from "../player.ts";
import { Session } from "../../domain/entities/session.ts";
import { accountEnv } from "../../env.ts";

const SESSION_TTL = accountEnv.REFRESH_TOKEN_LIFETIME / 1000
const S_IN_MONTH = 60*60*24*30

enum PayloadProps {
    playerId = "playerId",
    token = "token",
    userAgent = "userAgent",
    origin = "origin",
    issuedAt = "issuedAt",
    revokedAt = "revokedAt",
}

type PayloadContent = {
    playerId: number
    token: string,
    userAgent: string,
    origin: string,
    issuedAt: number,
    revokedAt?: number,
}

type Payload = { [P in PayloadProps as P]: PayloadContent[P] }

export class ValkeySession implements SessionCache {
    constructor(
        private readonly _conn: Valkey["_conn"]
    ) {}

    async create(s: Session): Promise<void> {
        const 
            sessionKey = ["player", `${s.playerId}`, "session"].join(":"),
            sessionInfoKey = ["session", `${s.playerId}`, `${s.userAgent}`].join(":"),
            payload: Payload = { 
                playerId: s.playerId,
                token: s.token,
                userAgent: s.userAgent,
                origin: s.origin,
                issuedAt: s.issuedAt.getTime(),
                revokedAt: undefined,
            }

        // Workaround since directly putting NX (which requires Redis > 7.0) 
        // doesn't work and one couldn't put the flag on `expire` function call
        const expDuration = 
            await this._conn
                .ttl(sessionKey)
                .then(res => res < 0? `${S_IN_MONTH}`: "KEEPTTL")
        await this._conn
            .multi()
            .sadd(sessionKey, sessionInfoKey)
            .expire(sessionKey, expDuration)
            .hset(sessionInfoKey, payload)
            .expire(sessionInfoKey, SESSION_TTL)
            .exec((err, _) => {
                if(err)
                    console.log(err)
            })
    }

    async find(
        playerId: Session["playerId"],
        userAgent: Session["userAgent"],
        _: Session["origin"] = "" // Future feature
    ): Promise<Session | undefined> {
        const sessionInfoKey = ["session", `${playerId}`, `${userAgent}`]
        const row = await this._conn.hgetall(sessionInfoKey.join(":"))

        if(!row["playerId"])
            return undefined
        return Session.create({ // Wish there's some kind of safety net here
            playerId: Number(row["playerId"]),
            token: row["token"],
            userAgent: row["userAgent"],
            origin: row["origin"],
            issuedAt: new Date(Number(row["issuedAt"])),
            revokedAt: row["revokedAt"]
                        ? new Date(Number(row["revokedAt"]))
                        : undefined,
        })
    }

    async revoke(
        playerId: number, 
        userAgent: Session["userAgent"],
        _: Session["origin"] = ""
    ): Promise<void> {
        const sessionInfoKey = ["session", `${playerId}`, `${userAgent}`].join(":")
        const now = `${(new Date).valueOf()}`
        await this._conn
            .hset(sessionInfoKey, PayloadProps.revokedAt, now)
    }
}