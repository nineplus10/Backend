import { NextFunction, Request, Response } from "express"
import { DomainError } from "_lib/errors/http/DomainError";
import { AppErr, AppError } from "_lib/errors/http/AppError";

export class ErrorHandler {
    constructor() {}

    public handle(err: Error, req: Request, res: Response, next: NextFunction) {
        const isSelfDefinedError = (
            err instanceof AppError
            || err instanceof DomainError )

        const {statusCode, sysErrName, sysErrMsg, clientErrShortMsg} = 
            isSelfDefinedError
            ? err.errSpec
            : { statusCode: 500,
                sysErrName: AppErr.Internal,
                sysErrMsg: "Something went wrong within server.",
                clientErrShortMsg: "Sorry! An error came from inside our system. Please try again later." }

        // For non-error throws (In case of it's just being used as a placeholder). 
        // Please refrain doing so in the code, though. It causes the debugging harder.
        if(!(err instanceof Error)) {
            console.log(`${err}`)
        }

        // For non-self-defined Errors (for example, the ones that was raised from libraries)
        let errDesc = err.message
        console.log(`[${sysErrName}] ${sysErrMsg}`)
        if(!(err instanceof AppError) && err.stack !== undefined) {
            const errLog =`Msg: ${err.message}\nCause:${err.cause}\nStack\n:${err.stack}\n`
            console.log(errLog)
            errDesc = "Something went wrong on our end and we're working our best to fix it. Sorry for your inconvenience"
        } 

        res.status(statusCode).send({
            message: clientErrShortMsg,
            description: errDesc})
        return
    }
}