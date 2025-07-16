import { AppErr, AppError } from "_lib/error/application";
import { Entity } from "../../_lib/domain/entity";
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
            throw new AppError(
                AppErr.BadValues,
                `Stats data doesn't belong to this player`)

        return new Player(props, id)
    }

    static get __name(): string {return Player._name}
    get username(): PlayerProps["username"] {return this._props.username}
    get password(): PlayerProps["password"] {return this._props.password}
    get email(): PlayerProps["email"] {return this._props.email}
    get bio(): PlayerProps["bio"] {return this._props.bio}
    get stats(): PlayerProps["stats"] {return this._props.stats}

    set bio(b: PlayerProps["bio"]) {this._props.bio = b}
}