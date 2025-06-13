import e from "express"
import express, {Response } from "express";
import cors from "cors"
import { Valkey } from "_lib/Persistence/Valkey";
import { Logger } from "_lib/Middlewares/Logger";
import { ErrorHandler } from "_lib/Middlewares/ErrorHandler";
import { AccountRouterV1 } from "./routes";
import { accountEnv } from "./env";

export class AccountModule {
    _app: e.Express

    constructor() {
        const upAt = Date.now()
        const vkConn = new Valkey(accountEnv.CACHE_URL)
        const loggerMiddleware = new Logger()
        const errorHandler = new ErrorHandler()

        const accountRouter = new AccountRouterV1(vkConn)

        this._app = express()
        this._app.use(loggerMiddleware.handle.bind(loggerMiddleware))
        this._app.use(cors({
            origin: ["http://localhost:8877"],// TODO: Consider moving it to .env, config, or something
            optionsSuccessStatus: 200 // Legacy support: https://expressjs.com/en/resources/middleware/cors.html#configuring-cors
        }))
        this._app.use(express.urlencoded({extended: false}))

        this._app.use("/api/account/v1", accountRouter.router)
        this._app.use("/health", (_, res: Response, __) => { 
            res.status(200)
                .send({ uptime: `${(Date.now() - upAt)/1000}s` })
        })
        this._app.use("/", (_, res: Response, __) => { res.status(404).send() })
        this._app.use(errorHandler.handle.bind(errorHandler))

    }

    listen(port: number): ReturnType<typeof this._app.listen> {
        return this._app.listen(port, () => {
            console.log(`Up and running on ${port}`)
        })
    }

}