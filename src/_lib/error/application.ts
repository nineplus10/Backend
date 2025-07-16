export enum AppErr {
    // standard HTTP statuses
    NotImplemented = "NotImplemented",
    NotFound = "NotFound",
    Forbidden = "Forbidden",
    Unauthorized = "Unauthorized",
    Internal = "Internal",
    BadRequest = "BadRequest",
    TooManyRequest = "TooManyRequest",

    BadValues = "BadValues",
}

export class AppError extends Error {
    constructor(name: AppErr, message: string, err?: Error) {
        super(message)
        this.name = name

        this.cause = err?.cause
        this.stack = err?.stack
    }
}