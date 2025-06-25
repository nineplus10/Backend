import { AuthChecker } from "account/_lib/Middlewares/AuthChecker";
import { ProfileController } from "account/controllers/profileController";
import express, { Router } from "express";

export class ProfileRouter {
    private _router: Router
    constructor(
        profileController: ProfileController,
        authValidator: AuthChecker
    ) {
        this._router = express.Router()
        this._router.use(authValidator.validate.bind(authValidator))
        this._router.get("/", profileController.getSelf.bind(profileController))
        this._router.put("/update", profileController.update.bind(profileController))
    }

    get router(): Router {return this._router}
}