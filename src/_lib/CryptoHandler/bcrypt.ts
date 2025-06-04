import { genSalt, hash, compare } from "bcrypt-ts";
import { CryptoHandler } from "./CryptoHandler.ts"

export class Bcrypt implements CryptoHandler {
    public async generate(message: string): Promise<string> {
        const hashed = await genSalt(10)
                            .then(salt => hash(message, salt))
                            .catch(e => {
                                console.log(`Digest generation failed: ${e}`)
                                return message
                            })
        return hashed
    }

    public async compare(message: string, digest: string): Promise<boolean> {
        const result = await compare(message, digest)
                            .then(result => result)
                            .catch(e => {
                                console.log(`Digest comparation failed: ${e}`)
                                return false
                            })
        return result
    }
}