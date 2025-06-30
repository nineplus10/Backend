import { AppErr, AppError } from "_lib/Error/http/AppError";
import { TokenHandler } from "_lib/TokenHandler";
import { NextFunction, Request, Response } from "express";

/**
 * Checks whether the request came from other 9p10 service which
 * characterized by the presence of valid API key/token
 */
export class ApiTokenChecker {
    constructor(
        private readonly _tokenHandler: TokenHandler
    ) { }

    async handle(req: Request, _: Response, next: NextFunction) {
        const apiKey = <string>req.headers["x-api-key"]
        if(!apiKey) {
            next(new AppError(AppErr.Forbidden, "API key not found"))
            return
        }

        const ok = apiKey == "THIS IS MY API KEY"
        if(!ok) {
            next(new AppError(AppErr.Forbidden, "API key invalid"))
            return
        }

        next()
    }
}