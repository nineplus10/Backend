import { NextFunction, Request, Response } from "express";
import { AppErr, AppError } from "_lib/Error/AppError";
import { ZodValidator } from "_lib/Validator/zod";
import { AuthService } from "account/services/auth";
import { z } from "zod";

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

        // TODO: I wonder if there's a better way to send these tokens
        await this._authService
            .login(data.username, data.password, req.ip ?? "???", "") // TODO: Acquire user agent info
            .then(({accessT, refreshT}) => {
                res.status(200) 
                    .send({
                        accessToken: accessT,
                        refreshToken: refreshT
                    })
            })
    }

    async refreshLogin(req: Request, res: Response, next: NextFunction) {
        if(!req.headers.authorization)
            return next(
                new AppError(
                    AppErr.BadRequest,
                    "Access token not found"
                ))

        await this._authService
            .refreshLogin(req.headers.authorization)
            .then(token => {
                res.status(200)
                    .set({
                        authorization: token
                    })
                    .send()
            })
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
    }
}