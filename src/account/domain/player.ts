import { DomainErr, DomainError } from "_lib/Error/DomainError";
import { Entity } from "../../_lib/Domain/Entity";
import { Stats } from "./entities/stats";
import { Bio } from "./values/bio";
import { Email } from "./values/email";
import { Handle } from "./values/handle";

interface PlayerProps {
    username: Handle,
    password: string,
    email: Email,
    bio: Bio,
    stats: Stats
}

export class Player extends Entity<PlayerProps> {
    private static readonly _name = "players";

    private constructor(props: PlayerProps, id?: number) {
        super(props, id)
    }
    
    static create(props: PlayerProps, id?: number) {
        if(props.stats.playerId !== id)
            throw new DomainError(
                DomainErr.InvalidValue,
                `Stats data doesn't belong to this player`)

        return new Player(props, id)
    }

    static get __name(): string {return Player._name}
    get username(): Handle {return this._props.username}
    get password(): string {return this._props.password}
    get email(): Email {return this._props.email}
    get bio(): Bio {return this._props.bio}
    get stats(): Stats {return this._props.stats}
}