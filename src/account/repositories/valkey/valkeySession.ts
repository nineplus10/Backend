import { Session } from "account/domain/entities/session";
import { gEnv } from "env";
import valkey from "iovalkey";
import { SessionCache } from "../player";

const SESSION_TTL = gEnv.REFRESH_TOKEN_LIFETIME / 1000
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
        private readonly _conn: valkey
    ) {}

    async create(s: Session): Promise<void> {
        const 
            sessionKey = ["player", `${s.playerId}`, "session"].join(":"),
            sessionInfoKey = ["session", `${s.playerId}`, `${s.userAgent}`].join(":")

        const payload: Payload = { 
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
        return await this._conn
            .hgetall(sessionInfoKey.join(":"))
            .then(result => {
                return Session.create({ // Wish there's some kind of safety net here
                    playerId: Number(result["playerId"]),
                    token: result["token"],
                    userAgent: result["userAgent"],
                    origin: result["origin"],
                    issuedAt: new Date(Number(result["issuedAt"])),
                    revokedAt: result["revokedAt"]
                                ? new Date(Number(result["revokedAt"]))
                                : undefined,
                })
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