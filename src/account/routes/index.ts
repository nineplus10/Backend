import express, { Response } from "express";
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

const vk = new Valkey() // TODO: refactor
const upAt = Date.now()
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
const v1AccountRouter = express.Router()
v1AccountRouter.use("/auth", authRouter.router)
v1AccountRouter.use("/profile", profileRouter.router)
v1AccountRouter.use("/health", (_, res: Response, __) => { 
    res.status(200)
        .send({ uptime: `${(Date.now() - upAt)/1000}s` })
})

export {v1AccountRouter};