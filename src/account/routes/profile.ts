import { AuthValidator } from "_lib/Middlewares/AuthValidator";
import { ProfileController } from "account/controllers/profileController";
import express, { Router } from "express";

export class ProfileRouter {
    private _router: Router
    constructor(
        profileController: ProfileController,
        authValidator: AuthValidator
    ) {
        this._router = express.Router()
        this._router.use(authValidator.validate.bind(authValidator))
        this._router.get("/", profileController.getSelf.bind(profileController))
    }

    get router(): Router {return this._router}
}