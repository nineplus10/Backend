import { AppErr, AppError } from "_lib/Error/http/AppError";
import { TokenHandler } from "_lib/TokenHandler";
import { NextFunction, Request, Response } from "express";
import { TokenExpiredError } from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
    player?: {
        id: number,
        tokenOk: boolean
    }
}

interface AuthPayload {
    playerId: number
}

export class AuthChecker {
    constructor(
        private readonly handler: TokenHandler,
    ) {}

    public validate(req: AuthenticatedRequest, _: Response, next: NextFunction) {
        const token = req.headers?.authorization
        if(token === undefined) {
            next(new AppError(AppErr.Unauthorized, "Please log in to your account first"))
            return
        }

        this.handler
            .decode<AuthPayload>(token)
            .then(payload => {
                req.player = {
                    id: payload.playerId,
                    tokenOk: true
                }
                next()
            })
            .catch(err => {
                // Source (25/02/28): https://github.com/auth0/node-jsonwebtoken/issues/963
                if(err instanceof TokenExpiredError) { 
                    next(new AppError(AppErr.Unauthorized, "Your token has expired. Please log in again"))
                    return
                }
                next(err)
            })
    }
}