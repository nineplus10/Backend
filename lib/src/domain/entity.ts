export class Entity<T extends object> {
    constructor(
       protected _props: T, 
       protected _id?: number
    ) {}

    toJSON() {
        return this._props
    }

    get id(): number | undefined {return this._id}
}