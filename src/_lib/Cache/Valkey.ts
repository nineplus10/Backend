import { gEnv } from "env";
import valkey from "iovalkey";
import { AppCache } from "./Cache";

export class Valkey<UsableKeys extends string> implements AppCache<UsableKeys> {
    private readonly _conn: valkey

    constructor() {
        this._conn = new valkey(gEnv.CACHE_URL)
    }

    async get(key: UsableKeys): Promise<any> {
        return await this._conn.get(key)
    }

    async set(key: UsableKeys, value: any): Promise<any> {
        return await this._conn.set(key, value)
    }
}