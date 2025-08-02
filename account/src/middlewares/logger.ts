import { NextFunction, Request, Response } from "express";

export class Logger {
    constructor() {}

    public handle(req: Request, _: Response, next: NextFunction) {
        console.log([
            req.method,
            req.ip ?? "???",
            req.path,
        ].join(" "))

        next()
    }
}