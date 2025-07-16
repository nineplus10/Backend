import { NextFunction, Request, Response } from "express";
import { AppErr, AppError } from "_lib/error/application";
import { ZodValidator } from "_lib/validation/zod";
import { AuthService } from "account/services/auth";
import { z } from "zod";
import { AuthenticatedRequest } from "account/_lib/middlewares/authChecker";
import { RefreshRequest } from "account/_lib/middlewares/refreshTokenChecker";

const LOGIN_PAYLOAD = z.object({
    username: z.string(),
    password: z.string()
})

const REGISTER_PAYLOAD = z.object({
    username: z.string(),
    email: z.string().email(),
    password: z.string().min(6),
    rePassword: z.string().min(6)
})

export class AuthController {
    constructor(
        private readonly _authService: AuthService
    ){}

    async login(req: Request, res: Response, next: NextFunction) {
        const validator = new ZodValidator<
            z.infer<typeof LOGIN_PAYLOAD>
                >(LOGIN_PAYLOAD)
        const {data, error} = validator.validate({
            username: req.body?.username,
            password: req.body?.password,
        })
        if(error)
            return next(new AppError(
                AppErr.BadRequest,
                validator.getErrMessage(error)))

        const 
            userIp = req.ip ?? "???",
            userAgent = req.headers["user-agent"] ?? "???"

        // TODO: I wonder if there's a better way to send these tokens
        await this._authService
            .login(data.username, data.password, userIp, userAgent)
            .then(({access, refresh}) => {
                res.status(200) 
                    .send({
                        accessToken: access,
                        refreshToken: refresh
                    })
            })
            .catch(err => next(err))
    }

    async register(req: Request, res: Response, next: NextFunction) {
        const validator = new ZodValidator<
            z.infer<typeof REGISTER_PAYLOAD>
                >(REGISTER_PAYLOAD)
        const {data, error} = validator.validate({
            username: req.body?.username,
            email: req.body?.email,
            password: req.body?.password,
            rePassword: req.body?.rePassword
        })
        if(error)
            return next(new AppError(
                AppErr.BadRequest,
                validator.getErrMessage(error)))

        await this._authService
            .register(data.username, data.email, data.password, data.rePassword)
            .then(_ => {
                res.status(201) 
                    .send({
                        msg: "Account has successfully be saved. Login with the submitted credentials for access.",
                    })
            })
            .catch(err => next(err))
    }

    async refresh(req: RefreshRequest, res: Response, next: NextFunction) {
        const 
            userAgent = req.headers["user-agent"] ?? "",
            playerId = req.refreshToken!.payload.playerId,
            token = req.refreshToken!.token

        await this._authService
            .refresh(playerId, token, userAgent)
            .then(({access, refresh}) => {
                res.status(200) 
                    .send({
                        accessToken: access,
                        refreshToken: refresh
                    })
            })
            .catch(err => next(err))
    }

    async revoke(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        const 
            userId = req.player?.id ?? -1,
            userAgent = req.headers["user-agent"] ?? ""

        await this._authService
            .revoke(userId, userAgent)
            .then(_ => {
                res.status(204).send()
            })
            .catch(err => next(err))
    }

    async infer(req: RefreshRequest, res: Response, next: NextFunction) {
        const 
            userAgent = req.headers["user-agent"] ?? "",
            playerId = req.refreshToken!.payload.playerId,
            token = req.refreshToken!.token

        await this._authService
            .inferAndRefresh(playerId, token, userAgent)
            .then(([player, tokens]) => {
                res.status(200)
                    .send({
                        player: {
                            id: player.id,
                            wins: player.stats.wins,
                            gamePlayed: player.stats.gamePlayed
                        },
                        accessToken: tokens.access,
                        refreshToken: tokens.refresh
                    })
            })
            .catch(err => next(err))
    }
}