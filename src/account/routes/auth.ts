import { AuthController } from "account/controllers/authController";
import express, { Router } from "express";

export class AuthRouter {
    private _router: Router
    constructor(
        authController: AuthController
    ) {
        this._router = express.Router()
        this._router.post("/login", authController.login.bind(authController))
        this._router.post("/register", authController.register.bind(authController))
        this._router.get("/refresh", authController.refreshLogin.bind(authController))
    }

    get router(): Router {return this._router}
}