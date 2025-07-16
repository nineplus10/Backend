import { AuthChecker } from "account/_lib/middlewares/authChecker";
import { ProfileController } from "account/controllers/profile";
import express, { Router } from "express";

export class ProfileRouter {
    private _router: Router
    constructor(
        profileController: ProfileController,
        authValidator: AuthChecker
    ) {
        this._router = express.Router()
        this._router
            .use(authValidator.validate.bind(authValidator))
            .get("/", profileController.getSelf.bind(profileController))
            .put("/update", profileController.update.bind(profileController))
    }

    get router(): Router {return this._router}
}