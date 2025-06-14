import { AuthRecord } from "account/domain/entities/authRecord";
import { Player } from "account/domain/player";
import { AuthRateLimitService } from "account/domain/services/authRateLimitService";
import { CredentialsService } from "account/domain/services/credentialsService";
import { CryptoHandler } from "_lib/CryptoHandler/CryptoHandler";
import { AppErr, AppError } from "_lib/Error/AppError";
import { TokenHandler } from "_lib/TokenHandler/TokenHandler";
import { PlayerRepo, SessionCache } from "account/repositories/player";
import { Session } from "account/domain/entities/session";
import { Handle } from "account/domain/values/handle";
import { Email } from "account/domain/values/email";
import { Bio } from "account/domain/values/bio";

type TokenPair = {refresh: string, access: string};
export class AuthService {
    constructor(
        private readonly _playerRepo: PlayerRepo,
        private readonly _sessionCache: SessionCache,
        private readonly _hasher: CryptoHandler,
        private readonly _accessTokenHandler: TokenHandler,
        private readonly _refreshTokenHandler: TokenHandler
    ) {}

    async login(
        username: string, 
        password: string,
        origin: string,
        userAgent: string,
    ): Promise<TokenPair> {
        let player: Player;
        let tokens: TokenPair

        return await AuthRateLimitService
            .calculateOriginBackoff(this._playerRepo, origin) // TODO: Perhaps this could be made into a middleware for generalization?
            .then(cooldown => {
                if(cooldown > 0)
                    throw new AppError(
                        AppErr.TooManyRequest,
                        `Too many failed attempt coming from your IP. Try again in ~${cooldown} minutes.`)
                return this._playerRepo.findByUsername(username)
            })
            .then(p => {
                if(!p)
                    throw new AppError(
                        AppErr.NotFound,
                        "Player not found")

                player = p
                return AuthRateLimitService
                    .calculateAccountBackoff( this._playerRepo, p.id!)
            })
            .then(cooldown => {
                if(cooldown > 0)
                    throw new AppError(
                        AppErr.TooManyRequest,
                        `Too many failed attempt coming for this player. Try again in ~${cooldown} minutes.`)
                return this._hasher.compare(password, player.password)
            })
            .then(ok => {
                const a = AuthRecord.create({
                    playerId: player.id!,
                    origin: origin,
                    attemptedAt: new Date(),
                    isOk: ok 
                })

                return Promise.all([
                    (async() => ok)(),
                    this._playerRepo.addAuthAttempt(a)
                ])
            })
            .then(([ok, _]) => {
                if(!ok)
                    throw new AppError(
                        AppErr.Unauthorized,
                        "Password doesn't match")

                return Promise.all([
                    this._refreshTokenHandler.encode({playerId: player.id}),
                    this._accessTokenHandler.encode({ playerId: player.id })
                ])
            })
            .then(([refreshToken, accessToken]) => {
                tokens = { refresh: refreshToken, access: accessToken }
                return this._hasher.generate(refreshToken)
            })
            .then(refreshDigest => {
                const s = Session.create({
                    playerId: player.id!,
                    origin: origin,
                    userAgent: userAgent,
                    token: refreshDigest,
                    issuedAt: new Date()
                })
                return this._sessionCache
                    .create(s)
            })
            .then(_ => tokens)
    }

    async register(
        username: string, 
        email: string,
        password: string, 
        rePassword: string
    ): Promise<void> {
        if(password != rePassword)
            throw new AppError(
                AppErr.BadRequest,
                "Password and repeat password doesn't match")

        await CredentialsService
            .getCredentialAvailability(this._playerRepo, username, email)
            .then(available => {
                if(!available)
                    throw new AppError(
                        AppErr.BadRequest,
                        "Email or username has been used, please use another")

                return this._hasher.generate(password)
            })
            .then(passDigest => {
                return this._playerRepo.create(
                    Handle.create(username),
                    passDigest,
                    Email.create(email),
                    Bio.create(""),
                )
            })
    }

    async refresh(
        playerId: number,
        token: string,
        userAgent: string,
        _: string = "" // Future feature: Origin
    ): Promise<TokenPair> {
        let activeSession: Session
        let newTokens: TokenPair

        return await this._sessionCache
            .find(playerId, userAgent)
            .then(session => {
                if(!session)
                    throw new AppError(
                        AppErr.Unauthorized,
                        "No active session found for this user")
                
                const hadRevoked =
                    session.revokedAt 
                    && Date.now() > session.revokedAt.getTime()
                if(hadRevoked)
                    throw new AppError(
                        AppErr.Unauthorized,
                        "Session has terminated, please login")

                activeSession = session
                return this._hasher.compare(token, session.token)
            })
            .then(ok => {
                if(!ok)
                    throw new AppError(
                        AppErr.Unauthorized,
                        "Token is invalid for this session")

                return Promise.all([
                    this._refreshTokenHandler.encode({playerId: playerId}),
                    this._accessTokenHandler.encode({ playerId: playerId })
                ])
            })
            .then(([refreshToken, accessToken]) => {
                newTokens = { refresh: refreshToken, access: accessToken }
                return this._hasher.generate(refreshToken)
            })
            .then(refreshDigest => {
                const s = Session.create({
                    playerId: playerId,
                    origin: activeSession.origin,
                    userAgent: activeSession.userAgent,
                    token: refreshDigest,
                    issuedAt: new Date()
                })
                return this._sessionCache.create(s)
            })
            .then(_ => newTokens)
    }

    async revoke(
        playerId: number,
        userAgent: string,
        _: string = "" // Future feature: Origin
    ): Promise<void> {
        return await this._sessionCache
            .revoke(playerId, userAgent)
    }
}