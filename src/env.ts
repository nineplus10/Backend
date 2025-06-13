import { configDotenv } from "dotenv"
import { z } from "zod"

configDotenv({ path: ".env" })

const MS_IN_MIN = 1000 * 60

const validator = z.object({
    ENV: z.string(),
    PORT: z.coerce.number().positive().max(65535),

    AUTH_MAX_FAIL: z.coerce.number().positive(),
    AUTH_FAIL_COOLDOWN: z.coerce.number().positive(),

    DB_URL: z.string(),
    CACHE_URL: z.string(),

    ACCESS_TOKEN_SECRET: z.string(),
    ACCESS_TOKEN_LIFETIME: z.coerce.number().positive(),
    REFRESH_TOKEN_SECRET: z.string(),
    REFRESH_TOKEN_LIFETIME: z.coerce.number().positive(),
})

const gEnv = validator.parse({
    ENV: process.env.ACC_APP_ENV,
    PORT: process.env.ACC_APP_PORT,

    ACCESS_TOKEN_SECRET: process.env.ACC_ACCESS_TOKEN_SECRET,
    ACCESS_TOKEN_LIFETIME: process.env.ACC_ACCESS_TOKEN_LIFETIME,
    REFRESH_TOKEN_SECRET: process.env.ACC_REFRESH_TOKEN_SECRET,
    REFRESH_TOKEN_LIFETIME: process.env.ACC_REFRESH_TOKEN_LIFETIME,

    AUTH_MAX_FAIL: process.env.ACC_AUTH_MAX_FAIL,
    AUTH_FAIL_COOLDOWN: process.env.ACC_AUTH_FAIL_COOLDOWN,

    DB_URL: process.env.ACC_DB_URL,
    CACHE_URL: process.env.ACC_CACHE_URL,
})

gEnv.REFRESH_TOKEN_LIFETIME *= MS_IN_MIN * 60
gEnv.ACCESS_TOKEN_LIFETIME *= MS_IN_MIN
gEnv.AUTH_FAIL_COOLDOWN *= MS_IN_MIN

export {gEnv};