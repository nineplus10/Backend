import { AppErr, AppError } from "_lib/Error/AppError";
import { TokenHandler } from "_lib/TokenHandler/TokenHandler";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
    player?: {id: number}
}

interface AuthPayload {
    playerId: number
}

export class AuthValidator {
    constructor(
        private readonly handler: TokenHandler,
    ) {}

    public validate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        const token = req.headers?.authorization
        if(token === undefined) {
            next(new AppError(AppErr.Unauthorized, "Please log in to your account first"))
            return
        }

        this.handler
            .decode<AuthPayload>(token)
            .then(payload => {
                req.player = {id: payload.playerId}
                next()
            })
            .catch(err => {
                // Source (25/02/28): https://github.com/auth0/node-jsonwebtoken/issues/963
                if(err instanceof jwt.TokenExpiredError) { 
                    next(new AppError(AppErr.Unauthorized, "Your token has expired. Please log in again"))
                    return
                }
                next(err)
            })
    }
}