export interface Validator<
    DataT, 
    ErrorT extends Error
> {
    getErrMessage(error: any): string;
    validate(val: any): {data: DataT, error?: ErrorT};
}