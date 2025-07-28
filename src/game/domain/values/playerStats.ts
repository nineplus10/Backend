import { Value } from "_lib/domain/value";
import { AppErr, AppError } from "_lib/error/application";
import { ZodValidator } from "_lib/validation/zod";
import { z } from "zod";

interface PlayerStatsProps {
    playerId: number,
    gamePlayed: number,
    wins: number
}

const VALID_PROPS = z.object({
    playerId: z.number().nonnegative(),
    wins: z.number().nonnegative(),
    gamePlayed: z.number().nonnegative()
})

export class PlayerStats extends Value<PlayerStatsProps> {
    private constructor(props: PlayerStatsProps) {
        super(props)
    }

    static create(props: PlayerStatsProps) {
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

        return new PlayerStats(data)
    }

    get playerId(): PlayerStatsProps["playerId"] {return this._props.playerId}
    get gamePlayed(): PlayerStatsProps["gamePlayed"] {return this._props.gamePlayed}
    get wins(): PlayerStatsProps["wins"] {return this._props.wins}
}