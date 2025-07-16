import { Entity } from "_lib/domain/entity";
import { AppErr, AppError } from "_lib/error/application";
import { ZodValidator } from "_lib/validation/zod";
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
            throw new AppError(
                AppErr.BadValues,
                "`wins` could not be larger than `gamePlayed`")

        return new Player(data, id)
    }

    get gamePlayed(): PlayerProps["gamePlayed"] {return this._props.gamePlayed}
    get wins(): PlayerProps["wins"] {return this._props.wins}
}