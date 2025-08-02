import { Value } from "@nineplus10/lib/src/domain/value.ts";
import { AppErr, AppError } from "@nineplus10/lib/src/error/application.ts";
import { ZodValidator } from "@nineplus10/lib/src/validation/zod.ts";
import { z } from "zod";

interface PlayerProps {
    id: number,
    gamePlayed: number,
    wins: number
}

const VALID_PROPS = z.object({
    id: z.number().nonnegative(),
    wins: z.number().nonnegative(),
    gamePlayed: z.number().nonnegative()
})

export class Player extends Value<PlayerProps> {
    private constructor(props: PlayerProps) {
        super(props)
    }

    static create(props: PlayerProps) {
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

        return new Player(data)
    }

    get id(): PlayerProps["id"] {return this._props.id}
    get gamePlayed(): PlayerProps["gamePlayed"] {return this._props.gamePlayed}
    get wins(): PlayerProps["wins"] {return this._props.wins}
}