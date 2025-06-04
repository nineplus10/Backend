import { AuthenticatedRequest } from "_lib/Middlewares/AuthValidator";
import { ProfileService } from "account/services/profile";
import { NextFunction, Request, Response } from "express";

export class ProfileController {
    constructor(
        private readonly _profileService: ProfileService
    ) {}

    async getSelf(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        await this._profileService
            .getSelf(req.user!.id)
            .then(p => {
                res.status(200)
                    .send({data: p})
            })
            .catch(err => next(err))
    }
}