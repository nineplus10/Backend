import { configDotenv } from "dotenv"
import { z } from "zod"

configDotenv({path: ".env"})
const validator = z.object({
    BROKER_PORT: z.coerce.number(),
    CACHE_URL: z.string()
})

const gameEnv = validator.parse({
    CACHE_URL: process.env.MM_CACHE_URL,
    BROKER_PORT: process.env.MM_BROKER1_PORT
})

export {gameEnv}