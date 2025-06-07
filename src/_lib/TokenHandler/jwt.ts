import jwt, { JwtPayload } from "jsonwebtoken";
import { TokenHandler } from "./TokenHandler.ts"
import { gEnv } from "env.ts";
import { TokenParser } from "_lib/TokenHandler/TokenParser/TokenParser.ts";

export class Jwt implements TokenHandler {
    private _secret: string;
    constructor(
        private readonly _type: "access" | "refresh",
        private readonly _parser: TokenParser
    ) {
        this._secret = this._type == "access"
                        ? gEnv.ACCESS_TOKEN_SECRET
                        : gEnv.REFRESH_TOKEN_SECRET
    }

    encode<T extends jwt.JwtPayload>(payload: T): Promise<string> {
        const tokenConfig = { 
            expiresIn: this._type == "access"
                        ? gEnv.ACCESS_TOKEN_LIFETIME
                        : gEnv.REFRESH_TOKEN_LIFETIME
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