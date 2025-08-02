import { Valkey } from "@nineplus10/lib/src/persistence/Valkey.js"
import cors from "cors"
import e, { Response } from "express"
import { accountEnv } from "./env.js"
import { Logger } from "./middlewares/logger.js"
import { ErrorHandler } from "./middlewares/errorHandler.js"
import { BearerParser } from "@nineplus10/lib/src/tokens/parser/bearer.js"
import { ProfileService } from "./services/profile.js"
import { PrismaPlayer } from "./repositories/prisma/prismaPlayer.js"
import { AuthService } from "./services/auth.js"
import { ValkeySession } from "./repositories/valkey/valkeySession.js"
import { Bcrypt } from "@nineplus10/lib/src/crypto/bcrypt.js"
import { ProfileRouter } from "./routes/profile.js"
import { ProfileController } from "./controllers/profile.js"
import { AuthChecker } from "./middlewares/authChecker.js"
import { AuthRouter } from "./routes/auth.js"
import { AuthController } from "./controllers/auth.js"
import { RefreshTokenChecker } from "./middlewares/refreshTokenChecker.js"
import { ApiTokenChecker } from "./middlewares/apiTokenChecker.js"
import { Jwt } from "@nineplus10/lib/src/tokens/jwt.js"

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
                    new BearerParser())
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
                    new AuthController (authService), 
                    new AuthChecker(accessTokenHandler), 
                    new RefreshTokenChecker(refreshTokenHandler),
                    new ApiTokenChecker(refreshTokenHandler))

        const appRouterV1 = e.Router()
        appRouterV1
            .use("/auth", authRouter.router)
            .use("/profile", profileRouter.router)

        e()
            .use(loggerMiddleware.handle.bind(loggerMiddleware))
            .use(cors({
                origin: ["http://localhost:8877"],// TODO: Consider moving it to .env, config, or something
                optionsSuccessStatus: 200 // Legacy support: https://expressjs.com/en/resources/middleware/cors.html#configuring-cors
            }))
            .use(e.urlencoded({extended: false}))
            .use("/api/account/v1", appRouterV1)
            .use("/health", (_, res: Response, __) => { 
                res.status(200)
                    .send({ uptime: `${(Date.now() - upAt)/1000}s` })
            })
            .use("/", (_, res: Response, __) => { res.status(404).send() })
            .use(errorHandler.handle.bind(errorHandler))
            .listen(port, () => {
                console.log(`Up and running on ${port}`)
            })
    }
}

AccountModule.start(accountEnv.APP_PORT)