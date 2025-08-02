import { configDotenv } from "dotenv"
import { z } from "zod"

configDotenv({path: ".env"})
const validator = z.object({
    APP_PORT: z.coerce.number().min(0).max(65536),
    ENV: z.union([z.literal("DEVEL"), z.literal("PROD")]),

    CACHE_URL: z.string().url(),

    /**
     * List of the message broker URLs
     * */
    BROKER_URL: z.array(z.string().url()),

    /**
     * Exposed topics for the application to receive the messages from
    */
    BROKER_SUB_TOPICS: z.object({
        matchmaking: z.string()
    }),

    /**
     * Exposed topics for the application to send the messages to
    */
    BROKER_PUB_TOPICS: z.object({
        matchmaking: z.string()
    }),

    /**
     * API key used to communicate with service-exclusive endpoints in `Account`
     * service
     */
    ACCOUNT_API_KEY: z.string(),

    /** URL for refreshing user token in `Account` service */
    AUTH_REFRESH_URL: z.string().url()
})

const gameEnv = validator.parse({
    APP_PORT: process.env.APP_PORT,
    ENV: process.env.APP_ENV,
    ACCOUNT_API_KEY: process.env.ACCOUNT_API_KEY,
    AUTH_REFRESH_URL: `${process.env.ACCOUNT_URL}${process.env.REFRESH_PATH}`,
    CACHE_URL: process.env.CACHE_URL,
    BROKER_URL: ["broker:19092"],
    BROKER_PUB_TOPICS: {
        matchmaking: "game.matchmaking.queue",
        accountActivity: "account.activity"
    },
    BROKER_SUB_TOPICS: {
        matchmaking: "game.matchmaking.queue"
    },
})

export {gameEnv}