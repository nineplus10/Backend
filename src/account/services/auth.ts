import { AuthRecord } from "account/domain/entities/AuthRecord";
import { Player } from "account/domain/Player";
import { AuthRateLimitService } from "account/domain/services/AuthRateLimitService";
import { CredentialsService } from "account/domain/services/CredentialsService";
import { CryptoHandler } from "_lib/CryptoHandler/CryptoHandler";
import { AppErr, AppError } from "_lib/Error/AppError";
import { TokenHandler } from "_lib/TokenHandler/TokenHandler";
import { PlayerRepo } from "account/repositories/Player";
import { Session } from "account/domain/entities/Session";
import { Handle } from "account/domain/values/handle";
import { Email } from "account/domain/values/email";
import { Bio } from "account/domain/values/bio";

export class AuthService {
    constructor(
        private readonly _playerRepo: PlayerRepo,
        private readonly _hasher: CryptoHandler,
        private readonly _accessTokenHandler: TokenHandler,
        private readonly _refreshTokenHandler: TokenHandler
    ) {}

    async login(
        username: string, 
        password: string,
        origin: string,
        userAgent: string,
    ): Promise< {refreshT: string, accessT: string} > {
        let player: Player;
        let tokenPair: {refreshT: string, accessT: string};

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
                    this._refreshTokenHandler.encode({}),
                    this._accessTokenHandler.encode({ playerId: player.id })
                ])
            })
            .then(([refreshToken, accessToken]) => {
                tokenPair = { refreshT: refreshToken, accessT: accessToken }
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
                return this._playerRepo.initiateSession(s)
            })
            .then(_ => tokenPair)
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

    async refreshLogin(
        token: string
    ): Promise< ReturnType< typeof this._accessTokenHandler.encode > | undefined > {
        return await this._playerRepo
            .checkSession(token)
            .then(s => {
                if(!s)
                    return undefined
                return s.token
            })
    }
}