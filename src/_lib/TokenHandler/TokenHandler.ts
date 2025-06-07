export interface TokenHandler {
    encode: <T extends object>(payload: T) => Promise<string>
    decode: <T extends object>( token: string, ) => Promise<T>
}