import valkey  from "iovalkey";

// // Make hgetall result to be an object
// valkey.Command.setReplyTransformer("hgetall", (result) => {
//     const res: {[prop: string]: any} = {}
//     for(let i = 0; i < result.length; i += 2) {
//         const key: string = result[i]
//         const value = result[i + 1]
//         res[key] = value
//     }
//     return res
// })

export class Valkey{
    private readonly _conn: valkey

    constructor(url: string) {
        this._conn = new valkey(url)
        // TODO: gracefully exit when initial connection has failed
    }

    get conn(): valkey {return this._conn}
}