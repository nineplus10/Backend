import { gEnv } from "env"
import { AppErr, AppError } from "lib/Error/AppError"
import { Pool, PoolClient, Query, QueryResult } from "pg"

const connPool = new Pool({
    host: gEnv.DB_HOST,
    port: gEnv.DB_PORT,
    user: gEnv.DB_USER,
    password: gEnv.DB_PASS,
    database: gEnv.DB_NAME
})

connPool.on("error", (err, client) => {
    throw new AppError(
        AppErr.Internal,
        "Pool connection problem",
        err)
})

// TODO: Escape values
export async function pgQuery(q: string, v: any[] = []): Promise<QueryResult> {
    return await connPool.query(q, v)
        .then(result => result)
}

export async function pgTx(
    txFx: (client: PoolClient) => Promise<void>
): Promise<void> {
    const client = await connPool.connect()
    await txFx(client)
}