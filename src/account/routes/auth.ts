import { ApiTokenChecker } from "account/_lib/Middlewares/ApiTokenChecker";
import { AuthChecker } from "account/_lib/Middlewares/AuthChecker";
import { RefreshTokenChecker } from "account/_lib/Middlewares/RefreshTokenChecker";
import { AuthController } from "account/controllers/authController";
import express, { Router } from "express";

export class AuthRouter {
    private _router: Router
    constructor(
        authController: AuthController,
        authValidator: AuthChecker,
        refreshTokenChecker: RefreshTokenChecker,
        apiTokenChecker: ApiTokenChecker
    ) {
        this._router = express.Router()
        this._router.post("/login", authController.login.bind(authController))
        this._router.post("/register", authController.register.bind(authController))

        this._router.post("/refresh", 
            refreshTokenChecker.validate.bind(refreshTokenChecker),
            authController.refresh.bind(authController))
        this._router.post("/revoke", 
            authValidator.validate.bind(authValidator),
            authController.revoke.bind(authController))
        this._router.post("/infer",
            refreshTokenChecker.validate.bind(refreshTokenChecker),
            apiTokenChecker.handle.bind(apiTokenChecker),
            authController.infer.bind(authController))
    }

    get router(): Router {return this._router}
}