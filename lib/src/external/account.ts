import { z } from "zod"
import { AppErr, AppError } from "../error/application.ts";
import { ZodValidator } from "../validation/zod.ts";

const 
    CHECK_AUTH_OK_PAYLOAD = z.object({
        player: z.object({
            id: z.number(),
            wins: z.number(),
            gamePlayed: z.number()
        }),
        accessToken: z.string(),
        refreshToken: z.string()
    }),
    CHECK_AUTH_ERR_PAYLOAD = z.object({
        message: z.string(),
        description: z.string()
    })

export class AccountApi {
    constructor(
        private readonly _authEndpoint: string,
        private readonly _apiKey: string
    ) { }

    async inferWithRefreshToken(
        userAgent: string,
        token: string,
    ): Promise<z.infer<typeof CHECK_AUTH_OK_PAYLOAD>>  {
        return await fetch(this._authEndpoint, {
                method: "POST",
                headers: {
                    "User-Agent": userAgent,
                    "Content-Type": "application/x-www-form-urlencoded",
                    "X-API-key": this._apiKey
                },
                body: new URLSearchParams({
                    refresh_token: token
                })        
            })
            .then(res => {
                return Promise.all([ res.status, res.json() ])
            })
            .then(([statusCode, payload]) => {
                if(statusCode != 200) {
                    let errName;
                    switch(statusCode) {
                        case 400: errName = AppErr.BadRequest; break;
                        case 401: errName = AppErr.Unauthorized; break;
                        case 404: errName = AppErr.NotFound; break;
                        default: errName = AppErr.Internal; break;
                    }

                    const validator = new ZodValidator<
                        z.infer<typeof CHECK_AUTH_ERR_PAYLOAD>
                            >(CHECK_AUTH_ERR_PAYLOAD)
                    const {error, data} = validator.validate(payload)
                    if(error) {
                        console.log("[Game] WARN: response shape doesn't match with the expected schema")
                        throw new AppError(errName, "Sorry, we couldn't identify what went wrong for now!") 
                    }
                    throw new AppError(errName, data.description) 
                }

                const validator = new ZodValidator<
                    z.infer<typeof CHECK_AUTH_OK_PAYLOAD>
                        >(CHECK_AUTH_OK_PAYLOAD)
                const {error, data} = validator.validate(payload)
                if(error)
                    throw new AppError(
                        AppErr.Internal,
                        `Received payload doesn't fulfill expected schema:\n${validator.getErrMessage(error)}`)

                return {
                    player: data.player,
                    accessToken: data.accessToken,
                    refreshToken: data.refreshToken
                }
            })
    }

}