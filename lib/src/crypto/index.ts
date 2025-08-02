export interface CryptoHandler {
    generate: (message: string) => string | Promise<string>
    compare: (message: string, digest: string) => Promise<boolean>
}