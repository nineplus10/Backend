import { configDotenv } from "dotenv"
import { z } from "zod"

configDotenv({path: ".env"})
const validator = z.object({
    /**
     * Endpoint for the cache used by this application
     * */
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

    AUTH_REFRESH_URL: z.string().url()
})

const gameEnv = validator.parse({
    AUTH_REFRESH_URL: `${process.env.MM_ACCOUNT_URL}${process.env.MM_REFRESH_PATH}`,
    CACHE_URL: process.env.MM_CACHE_URL,
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