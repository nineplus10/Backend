import { AuthValidator } from "_lib/Middlewares/AuthValidator";
import { AuthController } from "account/controllers/authController";
import express, { Router } from "express";

export class AuthRouter {
    private _router: Router
    constructor(
        authController: AuthController,
        authValidator: AuthValidator
    ) {
        this._router = express.Router()
        this._router.post("/login", authController.login.bind(authController))
        this._router.post("/register", authController.register.bind(authController))

        this._router.use(authValidator.validate.bind(authValidator))
        this._router.post("/refresh", authController.refresh.bind(authController))
        this._router.post("/revoke", authController.revoke.bind(authController))
    }

    get router(): Router {return this._router}
}