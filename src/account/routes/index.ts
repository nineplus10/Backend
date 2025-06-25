import express, { Response, Router } from "express";
import {AuthRouter } from "./auth";
import { AuthController } from "account/controllers/authController";
import { PrismaPlayer } from "account/repositories/prisma/prismaPlayer";
import { AuthService } from "account/services/auth";
import { Bcrypt } from "_lib/CryptoHandler/bcrypt";
import { Jwt } from "_lib/TokenHandler/jwt";
import { BearerParser } from "_lib/TokenHandler/Parser/bearer";
import { ProfileService } from "account/services/profile";
import { ProfileController } from "account/controllers/profileController";
import { ProfileRouter } from "./profile";
import { AuthChecker } from "account/_lib/Middlewares/AuthChecker";
import { ValkeySession } from "account/repositories/valkey/valkeySession";
import { Valkey } from "_lib/Persistence/Valkey";
import { accountEnv } from "account/env";
import { RefreshTokenChecker } from "account/_lib/Middlewares/RefreshTokenChecker";

export class AccountRouterV1 {
    private readonly _router: Router
    private readonly _upAt: number

    constructor( vk: Valkey) {
        this._upAt = Date.now()

        const 
            tokenParser = new BearerParser(),
            accessTokenHandler = new Jwt( accountEnv.ACCESS_TOKEN_SECRET,
                                    accountEnv.ACCESS_TOKEN_LIFETIME,
                                    tokenParser),
            refreshTokenHandler = new Jwt( accountEnv.REFRESH_TOKEN_SECRET,
                                        accountEnv.REFRESH_TOKEN_LIFETIME,
                                        tokenParser),
            authValidator = new AuthChecker(accessTokenHandler),
            refreshTokenChecker = new RefreshTokenChecker(refreshTokenHandler)

        const playerRepo = new PrismaPlayer()
        const sessionCache = new ValkeySession(vk.conn)

        const 
            profileService = new ProfileService(playerRepo),
            authService = new AuthService(
                                playerRepo, 
                                sessionCache,
                                new Bcrypt(), 
                                accessTokenHandler, 
                                refreshTokenHandler)
        const 
            authController = new AuthController(authService),
            profileController = new ProfileController(profileService)

        const 
            profileRouter = new ProfileRouter(profileController, authValidator),
            authRouter = new AuthRouter(authController, authValidator, refreshTokenChecker)

        this._router = express.Router()
        this._router.use("/auth", authRouter.router)
        this._router.use("/profile", profileRouter.router)
        this._router.use("/health", (_, res: Response, __) => { 
            res.status(200)
                .send({ uptime: `${(Date.now() - this._upAt)/1000}s` })
        })
    }

    get router(): Router {return this._router}
}