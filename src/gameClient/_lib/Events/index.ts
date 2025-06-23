export class GameEvent {
    constructor(
        private readonly name: string
    ) {}

    toPayload() {
        return this.name
    }
}