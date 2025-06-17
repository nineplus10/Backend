import { Entity } from "_lib/Domain/Entity";

interface PlayerProps {
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