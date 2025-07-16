import { ErrorAdapter, ErrSpec } from "..";
import { AppErr, AppError } from "../application";

export interface HttpErrSpec extends ErrSpec {
    statusCode: number,
    errName: string,
}

export class HttpErrorAdapter implements ErrorAdapter<object> {
    adapt(e: AppError): object {
        const spec = errorEntries[<AppErr>e.name]
        return spec
    }

    getSpec(e: AppError): HttpErrSpec {
        return errorEntries[<AppErr>e.name]
    }
}

const errorEntries: {[key in AppErr]: HttpErrSpec} = {
    [AppErr.BadRequest]: {
        statusCode: 400,
        errName: AppErr.BadRequest,
        description: "Information within request could not be processed",
        msg: "Sorry! We couldn't process your incomplete request."
    },
    [AppErr.NotFound] : {
        statusCode: 404,
        errName: AppErr.NotFound,
        description: "Resource not found within server.",
        msg: "Sorry! We could not find what you requested."
    },
    [AppErr.Forbidden] : {
        statusCode: 403,
        errName: AppErr.Forbidden,
        description: "Requester doesn't have enough privilege.",
        msg: "Sorry! You are not permitted to do so."
    },
    [AppErr.Unauthorized] : {
        statusCode: 401,
        errName: AppErr.Unauthorized,
        description: "Requester has not been authorized.",
        msg: "Sorry! We can't authorize you yet."
    },
    [AppErr.Internal] : {
        statusCode: 500,
        errName: AppErr.Internal,
        description: "Something went wrong within server.",
        msg: "Sorry! An error came from inside our system."
    },
    [AppErr.NotImplemented] : {
        statusCode: 501,
        errName: AppErr.NotImplemented,
        description: "Endpoint is not yet implemented.",
        msg: "We're cooking something awesome, stay tuned!"
    },
    [AppErr.TooManyRequest]: {
        statusCode: 429,
        errName: AppErr.TooManyRequest,
        description: "Too many requests within certain time frame.",
        msg: "Too fast! Please try again later"
    },

    [AppErr.BadValues] : {
        statusCode: 400,
        errName: AppErr.BadValues,
        description: "An error during data validation had occured.",
        msg: "Sorry! We couldn't process your request because of the invalid values on the received data."
    }
}
