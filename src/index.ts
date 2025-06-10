import { ErrorHandler } from "_lib/Middlewares/ErrorHandler";
import { Logger } from "_lib/Middlewares/Logger";
import { Valkey } from "_lib/Persistence/Valkey";
import { AccountRouterV1 } from "account/routes";
import { gEnv } from "env";
import express, {Response } from "express";
import cors from "cors"

const upAt = Date.now()
const vkConn = new Valkey()
const loggerMiddleware = new Logger()
const errorHandler = new ErrorHandler()

const accountRouter = new AccountRouterV1(vkConn)
const xpress = express()

xpress.use(loggerMiddleware.handle.bind(loggerMiddleware))
xpress.use(cors({
    origin: ["http://localhost:8877"],// TODO: Consider moving it to .env, config, or something
    optionsSuccessStatus: 200 // Legacy support: https://expressjs.com/en/resources/middleware/cors.html#configuring-cors
}))
xpress.use(express.urlencoded({extended: false}))

xpress.use("/api/account/v1", accountRouter.router)
xpress.use("/health", (_, res: Response, __) => { 
    res.status(200)
        .send({ uptime: `${(Date.now() - upAt)/1000}s` })
})
xpress.use("/", (_, res: Response, __) => { res.status(404).send() })
xpress.use(errorHandler.handle.bind(errorHandler))

xpress.listen(gEnv.PORT, () => {
    console.log(`Up and running on ${gEnv.PORT}`)
})