import { Entity } from "../../_lib/Domain/_Entity";

interface PlayerProps {
    username: string,
    password: string,
    email: string,
    bio: string
}

export class Player extends Entity<PlayerProps> {
    private static readonly _name = "pLayers";

    private constructor(props: PlayerProps, id?: number) {
        super(props, id)
    }
    
    static create(props: PlayerProps, id?: number) {
        // TODO: Validation...
        return new Player(props, id)
    }

    static get __name(): string {return Player._name}
    get username(): string {return this._props.username}
    get password(): string {return this._props.password}
    get email(): string {return this._props.email}
    get bio(): string {return this._props.bio}
}