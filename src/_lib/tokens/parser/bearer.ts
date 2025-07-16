import { TokenParser } from "./index.ts";

export class BearerParser implements TokenParser {
    public parse(token: string): string {
        return token.replace("Bearer ", "")
    }
}