import { AppError } from "./application";

export interface ErrSpec {
    description: string,
    msg: string,
}

type AdaptableErrors = AppError
export interface ErrorAdapter<AdaptedSpec> {
    adapt(err: AdaptableErrors): AdaptedSpec;
}