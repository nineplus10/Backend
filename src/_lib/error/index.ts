import { AppError } from "./application";

export interface ErrSpec {
    description: string,
    msg: string,
}

type AdaptableErrors = AppError
export interface ErrorAdapter<T> {
    adapt(err: AdaptableErrors): T;
}