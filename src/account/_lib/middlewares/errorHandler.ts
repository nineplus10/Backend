import { NextFunction, Request, Response } from "express"
import { AppErr, AppError } from "_lib/error/application";
import { HttpErrorAdapter, HttpErrSpec } from "_lib/error/adapter/http";

const ERR_ADAPTER = new HttpErrorAdapter()

export class ErrorHandler {
    constructor() {}

    private logError(name: string, description: string) {
        const msg  = `[Account] Err${name}: ${description}`
        switch(name) {
            case AppErr.Internal: console.error(msg); break
            default: console.log(msg); break
        }
    }

    handle(err: Error, req: Request, res: Response, next: NextFunction) {
        // Transforms non-error throws to internal server error. Despite 
        // being handled, please refrain from doing so
        if(!(err instanceof Error)) {
            const err2 = new AppError(AppErr.Internal, "Unidentified error happened")
            this.handle(err2, req, res, next)
            console.log(err)
            return 
        }

        const isCustomError = err instanceof AppError
        let spec: HttpErrSpec
        let clientMsg: string = err.message
        if(isCustomError) {
            const adaptedErr = ERR_ADAPTER.adapt(err)
            spec = adaptedErr.spec
            clientMsg = spec.msg
        } else {
            spec = {
                statusCode: 500,
                errName: AppErr.Internal,
                description: "Something went wrong within server.",
                msg: `${err.message}\ncause:${err.cause}\nstack\n:${err.stack}\n`
            }
            clientMsg = "Something went wrong on our end and we're working our best to fix it. Sorry for your inconvenience"
        }

        this.logError(spec.errName, spec.description)
        res.status(spec.statusCode).send({
            message: clientMsg,
            description: err.message})
        return
    }
}