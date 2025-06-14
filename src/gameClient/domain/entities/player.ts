import { Entity } from "_lib/Domain/Entity";
import { Handle } from "../values/handle";

interface PlayerProps {
    username: Handle
}

export class Player extends Entity<PlayerProps> {
    private constructor(props: PlayerProps, id?: number) {
        super(props, id)
    }

    static create(props: PlayerProps, id?: number) {
        // TODO: Add domain validation

        return new Player(props, id)
    }
}