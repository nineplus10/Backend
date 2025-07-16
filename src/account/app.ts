import express, { Response } from "express";
import { AuthController } from "account/controllers/auth";
import { PrismaPlayer } from "account/repositories/prisma/prismaPlayer";
import { AuthService } from "account/services/auth";
import { Bcrypt } from "_lib/crypto/bcrypt";
import { Jwt } from "_lib/tokens/jwt";
import { BearerParser } from "_lib/tokens/parser/bearer";
import { ProfileService } from "account/services/profile";
import { ProfileController } from "account/controllers/profile";
import { AuthChecker } from "account/_lib/middlewares/authChecker";
import { ValkeySession } from "account/repositories/valkey/valkeySession";
import { Valkey } from "_lib/persistence/Valkey";
import { accountEnv } from "account/env";
import { RefreshTokenChecker } from "account/_lib/middlewares/refreshTokenChecker";
import { ApiTokenChecker } from "account/_lib/middlewares/apiTokenChecker";
import { Logger } from "account/_lib/middlewares/logger";
import { ErrorHandler } from "account/_lib/middlewares/errorHandler";
import e from "express";
import cors from "cors";
import { ProfileRouter } from "./routes/profile";
import { AuthRouter } from "./routes/auth";

export class AccountModule {
    static start(port: number) {
        const 
            upAt = Date.now(),
            vkConn = new Valkey(accountEnv.CACHE_URL),
            loggerMiddleware = new Logger(),
            errorHandler = new ErrorHandler(),
            accessTokenHandler = 
                new Jwt( 
                    accountEnv.ACCESS_TOKEN_SECRET,
                    accountEnv.ACCESS_TOKEN_LIFETIME,
                    new BearerParser()),
            refreshTokenHandler = 
                new Jwt(
                    accountEnv.REFRESH_TOKEN_SECRET,
                    accountEnv.REFRESH_TOKEN_LIFETIME,
                    new BearerParser)
        const 
            profileService = new ProfileService(new PrismaPlayer()),
            authService = 
                new AuthService(
                    new PrismaPlayer(), 
                    new ValkeySession(vkConn.conn),
                    new Bcrypt(), 
                    accessTokenHandler, 
                    refreshTokenHandler)
        const 
            profileRouter = 
                new ProfileRouter(
                    new ProfileController(profileService), 
                    new AuthChecker(accessTokenHandler)),
            authRouter = 
                new AuthRouter(
                    new AuthController(authService), 
                    new AuthChecker(accessTokenHandler), 
                    new RefreshTokenChecker(refreshTokenHandler),
                    new ApiTokenChecker(refreshTokenHandler))

        const appRouterV1 = e.Router()
        appRouterV1
            .use("/auth", authRouter.router)
            .use("/profile", profileRouter.router)

        express()
            .use(loggerMiddleware.handle.bind(loggerMiddleware))
            .use(cors({
                origin: ["http://localhost:8877"],// TODO: Consider moving it to .env, config, or something
                optionsSuccessStatus: 200 // Legacy support: https://expressjs.com/en/resources/middleware/cors.html#configuring-cors
            }))
            .use(express.urlencoded({extended: false}))
            .use("/api/account/v1", appRouterV1)
            .use("/health", (_, res: Response, __) => { 
                res.status(200)
                    .send({ uptime: `${(Date.now() - upAt)/1000}s` })
            })
            .use("/", (_, res: Response, __) => { res.status(404).send() })
            .use(errorHandler.handle.bind(errorHandler))
            .listen(port, () => {
                console.log(`[Account] Up and running on ${port}`)
            })
    }
}