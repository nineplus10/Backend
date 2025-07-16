import { ApiTokenChecker } from "account/_lib/middlewares/apiTokenChecker";
import { AuthChecker } from "account/_lib/middlewares/authChecker";
import { RefreshTokenChecker } from "account/_lib/middlewares/refreshTokenChecker";
import { AuthController } from "account/controllers/auth";
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
        this._router
            .post("/login", authController.login.bind(authController))
            .post("/register", authController.register.bind(authController))

            .post("/refresh", 
                refreshTokenChecker.validate.bind(refreshTokenChecker),
                authController.refresh.bind(authController))
            .post("/revoke", 
                authValidator.validate.bind(authValidator),
                authController.revoke.bind(authController))
            .post("/infer",
                refreshTokenChecker.validate.bind(refreshTokenChecker),
                apiTokenChecker.handle.bind(apiTokenChecker),
                authController.infer.bind(authController))
    }

    get router(): Router {return this._router}
}