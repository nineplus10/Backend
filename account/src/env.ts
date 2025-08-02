import { configDotenv } from "dotenv"
import { z } from "zod"

configDotenv({ path: ".env" })

const MS_IN_MIN = 1000 * 60

const validator = z.object({
    APP_PORT: z.coerce.number().min(0).max(65536),
    ENV: z.union([z.literal("DEVEL"), z.literal("PROD")]),

    AUTH_MAX_FAIL: z.coerce.number().positive(),
    AUTH_FAIL_COOLDOWN: z.coerce.number().positive(),

    DB_URL: z.string(),
    CACHE_URL: z.string(),

    ACCESS_TOKEN_SECRET: z.string(),
    ACCESS_TOKEN_LIFETIME: z.coerce.number().positive(),
    REFRESH_TOKEN_SECRET: z.string(),
    REFRESH_TOKEN_LIFETIME: z.coerce.number().positive(),
})

const accountEnv = validator.parse({
    APP_PORT: process.env.APP_PORT,
    ENV: process.env.APP_ENV,

    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
    ACCESS_TOKEN_LIFETIME: process.env.ACCESS_TOKEN_LIFETIME,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
    REFRESH_TOKEN_LIFETIME: process.env.REFRESH_TOKEN_LIFETIME,

    AUTH_MAX_FAIL: process.env.AUTH_MAX_FAIL,
    AUTH_FAIL_COOLDOWN: process.env.AUTH_FAIL_COOLDOWN,

    DB_URL: process.env.DB_URL,
    CACHE_URL: process.env.CACHE_URL,
})

accountEnv.REFRESH_TOKEN_LIFETIME *= MS_IN_MIN * 60
accountEnv.ACCESS_TOKEN_LIFETIME *= MS_IN_MIN
accountEnv.AUTH_FAIL_COOLDOWN *= MS_IN_MIN

export {accountEnv};