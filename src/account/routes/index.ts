import express, { Response, Router } from "express";
import {AuthRouter } from "./auth";
import { AuthController } from "account/controllers/authController";
import { PrismaPlayer } from "account/repositories/prisma/prismaPlayer";
import { AuthService } from "account/services/auth";
import { Bcrypt } from "_lib/CryptoHandler/bcrypt";
import { Jwt } from "_lib/TokenHandler/jwt";
import { BearerParser } from "_lib/TokenHandler/TokenParser/bearer";
import { ProfileService } from "account/services/profile";
import { ProfileController } from "account/controllers/profileController";
import { ProfileRouter } from "./profile";
import { AuthValidator } from "_lib/Middlewares/AuthValidator";
import { ValkeySession } from "account/repositories/valkey/valkeySession";
import { Valkey } from "_lib/Persistence/Valkey";

export class AccountRouterV1 {
    private readonly _router: Router
    private readonly _upAt: number

    constructor( vk: Valkey) {
        this._upAt = Date.now()

        const tokenParser = new BearerParser()
        const authValidator = new AuthValidator(new Jwt("access", tokenParser))

        const playerRepo = new PrismaPlayer()
        const sessionCache = new ValkeySession(vk.conn)

        const authService = new AuthService(
                                playerRepo, 
                                sessionCache,
                                new Bcrypt(), 
                                new Jwt("access", tokenParser),
                                new Jwt("refresh", tokenParser))
        const profileService = new ProfileService(playerRepo)

        const authController = new AuthController(authService)
        const profileController = new ProfileController(profileService)

        const profileRouter = new ProfileRouter(profileController, authValidator)
        const authRouter = new AuthRouter(authController, authValidator)

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