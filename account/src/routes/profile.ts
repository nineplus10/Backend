import express, { Router } from "express";
import { ProfileController } from "../controllers/profile.js";
import { AuthChecker } from "../middlewares/authChecker.js";

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