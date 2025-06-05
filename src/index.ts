import { ErrorHandler } from "_lib/Middlewares/ErrorHandler";
import { Logger } from "_lib/Middlewares/Logger";
import { v1AccountRouter } from "account/routes";
import { gEnv } from "env";
import express, {Response } from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";

const upAt = Date.now()
const loggerMiddleware = new Logger()
const errorHandler = new ErrorHandler()

const xpress = express()
xpress.use(loggerMiddleware.handle.bind(loggerMiddleware))
xpress.use(express.urlencoded({extended: false}))
xpress.use("/api/account/v1", v1AccountRouter)
xpress.use("/health", (_, res: Response, __) => { 
    res.status(200)
        .send({ uptime: `${(Date.now() - upAt)/1000}s` })
})

xpress.use("/", (_, res: Response, __) => { res.status(404).send() })
xpress.use(errorHandler.handle.bind(errorHandler))

const srv = createServer(xpress)
const ws = new Server(srv)
ws.on("connection", () => {
    console.log("[WBS] Somebody has joined the connection!")
})

srv.listen(gEnv.PORT, () => {
    console.log(`Up and running on ${gEnv.PORT}`)
})