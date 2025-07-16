export class Value<T extends object> {
    constructor(
        protected readonly _props: T,
    ) {}
}