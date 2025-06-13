import jwt, { JwtPayload } from "jsonwebtoken";
import { TokenHandler } from "./TokenHandler.ts"
import { TokenParser } from "_lib/TokenHandler/TokenParser/TokenParser.ts";

export class Jwt implements TokenHandler {
    constructor(
        private readonly _secret: string,
        private readonly _lifetime: number,
        private readonly _parser: TokenParser
    ) { }

    encode<T extends jwt.JwtPayload>(payload: T): Promise<string> {
        const tokenConfig = { 
            expiresIn: this._lifetime
        }

        return new Promise((resolve, reject) => {
            jwt.sign(
                payload, 
                this._secret, 
                tokenConfig,
                (err, token) => {
                    if(token === undefined) {
                        reject(err)
                        return
                    }
                    resolve(token)
                })
        })
    }

    decode<T extends JwtPayload>(
        token: string, 
        ignoreInvalid: boolean = false
    ): Promise<T> {
        return new Promise((resolve, reject) => {
            jwt.verify(
                this._parser.parse(token),
                this._secret,
                (err, payload) => (
                    err && !ignoreInvalid
                        ? reject(err)
                        : resolve(payload! as T)
            ))
        })
    }
}