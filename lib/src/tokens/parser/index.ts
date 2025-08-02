export interface TokenParser {
    parse: (token: string) => string;
}