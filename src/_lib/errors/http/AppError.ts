import { ErrSpecEntry } from "../index.ts"

export enum AppErr {
    // standard HTTP statuses
    NotImplemented = "NotImplemented",
    NotFound = "NotFound",
    Forbidden = "Forbidden",
    Unauthorized = "Unauthorized",
    Internal = "Internal",
    BadRequest = "BadRequest",
    TooManyRequest = "TooManyRequest",

    ValidationError = "ValidationError",

    DBInternal = "DBInternalError",
    DBInconsistent = "DBInconsistent"
}

export class AppError extends Error {
    private static readonly _ERR_LIST: {[key in AppErr]: ErrSpecEntry} = {
        // standard HTTP statuses
        [AppErr.BadRequest]: {
            statusCode: 400,
            sysErrName: AppErr.BadRequest,
            sysErrMsg: "Information within request could not be processed",
            clientErrShortMsg: "Sorry! We couldn't process your request. Please enter different information."
        },
        [AppErr.NotFound] : {
            statusCode: 404,
            sysErrName: AppErr.NotFound,
            sysErrMsg: "Resource not found within server.",
            clientErrShortMsg: "Sorry! We could not find what you requested. Please try again with different search term."
        },
        [AppErr.Forbidden] : {
            statusCode: 403,
            sysErrName: AppErr.Forbidden,
            sysErrMsg: "Requester doesn't have enough privilege.",
            clientErrShortMsg: "Sorry! You are not permitted to do so. Please try with another account with such permission."
        },
        [AppErr.Unauthorized] : {
            statusCode: 401,
            sysErrName: AppErr.Unauthorized,
            sysErrMsg: "Requester has not been authorized.",
            clientErrShortMsg: "Sorry! We can't authorize you yet. Please try again."
        },
        [AppErr.Internal] : {
            statusCode: 500,
            sysErrName: AppErr.Internal,
            sysErrMsg: "Something went wrong within server.",
            clientErrShortMsg: "Sorry! An error came from inside our system. Please try again later."
        },
        [AppErr.NotImplemented] : {
            statusCode: 501,
            sysErrName: AppErr.NotImplemented,
            sysErrMsg: "Endpoint is not yet implemented.",
            clientErrShortMsg: "We're cooking something awesome, stay tuned!"
        },
        [AppErr.TooManyRequest]: {
            statusCode: 429,
            sysErrName: AppErr.TooManyRequest,
            sysErrMsg: "Too many requests within certain time frame.",
            clientErrShortMsg: "Too fast! Please try again later"
        },

        [AppErr.ValidationError] : {
            statusCode: 400,
            sysErrName: AppErr.ValidationError,
            sysErrMsg: "An error during data validation had occured.",
            clientErrShortMsg: "Sorry! We found invalid data in the data you've sent. Please recheck and resend it."
        },
        [AppErr.DBInconsistent]: {
            statusCode: 500,
            sysErrName: AppErr.DBInconsistent,
            sysErrMsg: "An inconsistency of data has been found",
            clientErrShortMsg: "Sorry! We found abnormality within our data integrity. Please try again later!"
        },
        [AppErr.DBInternal]: {
            statusCode: 500,
            sysErrName: AppErr.DBInternal,
            sysErrMsg: "An error during database operation had occured",
            clientErrShortMsg: "Sorry! We faced a problem during loading/saving your data. Please try again later!"
        }
    }

    constructor(name: AppErr, message: string, err?: Error) {
        super(message)
        this.name = name

        this.cause = err?.cause
        this.stack = err?.stack
    }

    get errSpec(): ErrSpecEntry {return AppError._ERR_LIST[<AppErr>this.name]}
}