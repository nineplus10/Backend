import { AppError } from "./application.ts";

export interface ErrSpec {
    description: string,
    msg: string,
}

type AdaptableErrors = AppError
export interface ErrorAdapter<AdaptedSpec> {
    adapt(err: AdaptableErrors): AdaptedSpec;
}