import { AuthRecord } from "account/domain/entities/authRecord";
import { Player } from "account/domain/player";
import { AuthRateLimitService } from "account/domain/services/authRateLimitService";
import { CredentialsService } from "account/domain/services/credentialsService";
import { CryptoHandler } from "_lib/crypto";
import { AppErr, AppError } from "_lib/errors/http/AppError";
import { TokenHandler } from "_lib/tokens";
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
        // TODO: Perhaps this could be made into a middleware for generalization?
        const originCooldown =  
            await AuthRateLimitService.calculateOriginBackoff(this._playerRepo, origin) 
        if(originCooldown > 0)
            throw new AppError(
                AppErr.TooManyRequest,
                `Too many failed attempt coming from your IP. Try again in ~${originCooldown} minutes.`)

        const player = await this._playerRepo.findByUsername(username)
        if(!player)
            throw new AppError(
                AppErr.NotFound,
                "Player not found")

        const accountCooldown = 
            await AuthRateLimitService.calculateAccountBackoff( this._playerRepo, player.id!)
        if(accountCooldown > 0)
            throw new AppError(
                AppErr.TooManyRequest,
                `Too many failed attempt coming for this player. Try again in ~${accountCooldown} minutes.`)
        
        const 
            passOk = await this._hasher.compare(password, player.password),
            attempt = AuthRecord.create({
                playerId: player.id!,
                origin: origin,
                attemptedAt: new Date(),
                isOk: passOk
            })
        await this._playerRepo.addAuthAttempt(attempt)

        if(!passOk)
            throw new AppError(
                AppErr.Unauthorized,
                "Password doesn't match")

        const 
            refreshToken = await this._refreshTokenHandler.encode({playerId: player.id}),
            accessToken = await this._accessTokenHandler.encode({ playerId: player.id }),
            refreshTokenDigest = await this._hasher.generate(refreshToken),
            s = Session.create({
                playerId: player.id!,
                origin: origin,
                userAgent: userAgent,
                token: refreshTokenDigest,
                issuedAt: new Date()
            })
        await this._sessionCache.create(s)

        return { refresh: refreshToken, access: accessToken }
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

        const credentialAvailable = 
            await CredentialsService.getCredentialAvailability(this._playerRepo, username, email)
        if(!credentialAvailable)
            throw new AppError(
                AppErr.BadRequest,
                "Email or username has been used, please use another")

        const passDigest = await this._hasher.generate(password)
        await this._playerRepo.create(
            Handle.create(username),
            passDigest,
            Email.create(email),
            Bio.create(""))
    }

    async refresh(
        playerId: number,
        token: string,
        userAgent: string,
        _: string = "" // Future feature: Origin
    ): Promise<TokenPair> {
        const session =  await this._sessionCache.find(playerId, userAgent)
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

        const refreshTokenOk = await this._hasher.compare(token, session.token)
        if(!refreshTokenOk)
            throw new AppError(
                AppErr.Unauthorized,
                "Token is invalid for this session")

        const
            payload = { playerId: playerId },
            refreshToken = await this._refreshTokenHandler.encode(payload),
            accessToken = await this._accessTokenHandler.encode(payload)

        const
            refreshTokenDigest = await this._hasher.generate(refreshToken),
            newSession = Session.create({
                playerId: playerId,
                origin: session.origin,
                userAgent: session.userAgent,
                token: refreshTokenDigest,
                issuedAt: new Date()
            })
        await this._sessionCache.create(newSession)

        return { refresh: refreshToken, access: accessToken }
    }

    async revoke(
        playerId: number,
        userAgent: string,
        _: string = "" // Future feature: Origin
    ): Promise<void> {
        return await this._sessionCache.revoke(playerId, userAgent)
    }

    async inferAndRefresh(
        playerId: number,
        token: string,
        userAgent: string,
        _: string = "" // Future feature: Origin
    ): Promise<[Player, TokenPair]> {
        const player = await this._playerRepo .findById(playerId)
        if(!player)
            throw new AppError(
                AppErr.NotFound,
                "Player not found")

        const newToken = await this.refresh(playerId, token, userAgent, _)
        return [player, newToken]
    }
}