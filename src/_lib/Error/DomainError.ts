import { ErrSpecEntry } from "./index.ts"

export enum DomainErr {
    InvalidValue = "InvalidValue",
}

export class DomainError extends Error {
    private static readonly _ERR_LIST: {[key in DomainErr]: ErrSpecEntry} = {
        [DomainErr.InvalidValue]: {
            statusCode: 400,
            sysErrName: DomainErr.InvalidValue,
            sysErrMsg: "ValueObject has invalid value",
            clientErrShortMsg: "DomainErr<InvalidValue>"
        },
    }

    constructor(name: DomainErr, message: string, err?: Error) {
        super(message)
        this.name = name
    }

    get errSpec(): ErrSpecEntry {return DomainError._ERR_LIST[<DomainErr>this.name]}
}