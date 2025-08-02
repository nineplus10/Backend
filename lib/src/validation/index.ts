export interface Validator<
    DataT,
    ErrT extends Error,
> {
    getErrMessage(error: any): string;
    validate(val: any): {data: DataT, error?: ErrT};
}