import { gEnv } from "env";
import valkey  from "iovalkey";

export class Valkey{
    private readonly _conn: valkey

    constructor() {
        this._conn = new valkey(gEnv.CACHE_URL)
        // TODO: gracefully exit when initial connection has failed
    }

    get conn(): valkey {return this._conn}
}