import { NextFunction, Response } from "express";
import { z } from "zod";
import { ProfileService } from "../services/profile.ts";
import { AuthenticatedRequest } from "../middlewares/authChecker.ts";
import { AppErr, AppError } from "@nineplus10/lib/src/error/application.ts";
import { ZodValidator } from "@nineplus10/lib/src/validation/zod.ts";

const UPDATE_PAYLOAD = z.object({
    bio: z.string()
})

export class ProfileController {
    constructor(
        private readonly _profileService: ProfileService
    ) {}

    async getSelf(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        const userId = req.player?.id
        if(!userId)
            return next(new AppError(
                AppErr.BadRequest,
                "No playerId was found within the request"))

        await this._profileService
            .getSelf(userId)
            .then(p => {
                res.status(200)
                    .send({data: p})
            })
            .catch(err => next(err))
    }

    async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        const userId = req.player?.id
        if(!userId)
            return next(new AppError(
                AppErr.BadRequest,
                "No playerId was found within the request"))

        const validator = new ZodValidator<
            z.infer<typeof UPDATE_PAYLOAD>
                >(UPDATE_PAYLOAD)
        const {data, error} = validator.validate({
            bio: req.body.bio
        })
        if(error)
            return next(new AppError(
                AppErr.BadRequest,
                validator.getErrMessage(error)))

        await this._profileService
            .update(userId, data.bio)
            .then(p => {
                res.status(200)
                    .send({data: p})
            })
            .catch(err => next(err))
    }
}