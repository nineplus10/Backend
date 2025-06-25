import { Entity } from "_lib/Domain/Entity";
import { DomainErr, DomainError } from "_lib/Error/http/DomainError";
import { ZodValidator } from "_lib/Validator/zod";
import { z } from "zod";

interface PlayerProps {
    gamePlayed: number,
    wins: number
}

const VALID_PROPS = z.object({
    wins: z.number().nonnegative(),
    gamePlayed: z.number().nonnegative()
})

export class Player extends Entity<PlayerProps> {
    private constructor(props: PlayerProps, id?: number) {
        super(props, id)
    }

    static create(props: PlayerProps, id?: number) {
        const validator = new ZodValidator<
            z.infer<typeof VALID_PROPS>
                >(VALID_PROPS)
        const {data, error} = validator.validate(props)
        if(error)
            throw new Error(validator.getErrMessage(error))

        if(props.wins > props.gamePlayed)
            throw new DomainError(
                DomainErr.InvalidValue,
                "`wins` could not be larger than `gamePlayed`")

        return new Player(data, id)
    }

    get gamePlayed(): PlayerProps["gamePlayed"] {return this._props.gamePlayed}
    get wins(): PlayerProps["wins"] {return this._props.wins}
}