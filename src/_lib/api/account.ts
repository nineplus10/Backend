export class AccountApi {
    static async checkAuth(
        authEndpoint: string, 
        userAgent: string,
        token: string,
    ): Promise<{access: string, refresh: string}>  {
        return await fetch(authEndpoint, {
                method: "POST",
                headers: {
                    "User-Agent": userAgent,
                    "Content-Type": "application/x-www-form-urlencoded"
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
                    switch(statusCode) {
                        case 400: throw new Error("TOKEN_NOT_FOUND")
                        case 401: throw new Error("TOKEN_INVALID")
                        default: throw new Error("UNKNOWN_REASON")
                    }
                }

                let accessTokenOk = true, refreshTokenOk = true
                if(!payload.accessToken) {
                    accessTokenOk = false
                    console.log("[Game] WARN: Missing `accessToken` after successful refresh")
                }
                if(!payload.refreshToken) {
                    refreshTokenOk = false
                    console.log("[Game] WARN: Missing `refreshToken` after successful refresh")
                }
                if(!accessTokenOk || !refreshTokenOk)
                    throw new Error("MALFORMED_NEW_TOKEN")
            
                return {
                    access: payload.accessToken,
                    refresh: payload.refreshToken
                }
            })
    }

}