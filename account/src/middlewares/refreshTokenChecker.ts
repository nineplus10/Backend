import { AppErr, AppError } from "@nineplus10/lib/src/error/application.ts"
import { TokenHandler } from "@nineplus10/lib/src/tokens/index.ts"
import { NextFunction, Request, Response } from "express"

interface TokenPayload {
    playerId: number
}

export interface RefreshRequest extends Request {
    refreshToken?: {
        token: string 
        payload: TokenPayload
    }
}

export class RefreshTokenChecker {
    constructor(
        private readonly handler: TokenHandler,
    ) {}

    public validate(req: RefreshRequest, _: Response, next: NextFunction) {
        const token = req.body["refresh_token"]
        if(!token)
            return next(
                new AppError(
                    AppErr.BadRequest,
                    "Refresh token not found"))

        this.handler
            .decode<TokenPayload>(token)
            .then(payload => {
                req.refreshToken = {
                    token: token,
                    payload: {
                        playerId: payload.playerId
                    }
                }
                next()
            })
            .catch(err => {
                return next(
                    new AppError(
                        AppErr.BadRequest,
                        "Inserted token may be invalid or has expired. Please login again to see whether the issue persists.",
                        err)
                )
            })
    }
}