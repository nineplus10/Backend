import { ZodValidator } from "_lib/validation/zod"
import { Message, OnErrorFx, Response } from "_lib/websocket"
import { MatchService } from "game/services/match"
import { z } from "zod"

const VALID_JOIN_POOL = z.object({
    playerId: z.coerce.number(),
    wins: z.coerce.number(),
    gamePlayed: z.coerce.number()
})
const VALID_LEAVE_POOL = z.object({
    playerId: z.coerce.number()
})

export class MatchController {
    constructor(
        private readonly _matchService: MatchService,
    ) {}

    async joinPool(msg: Message, _: Response, onError: OnErrorFx) {
        const props = {
            playerId: msg.data.player.id,
            wins: msg.data.player.wins,
            gamePlayed: msg.data.player.gamePlayed
        }
        const validator = new ZodValidator<
            z.infer<typeof VALID_JOIN_POOL>
                >(VALID_JOIN_POOL)
        const {data, error} = validator.validate(props)
        if(error) {
            onError(new Error(validator.getErrMessage(error)))
            return
        }

        await this._matchService
            .joinPool(data.playerId, data.gamePlayed, data.wins)
            .catch(err => onError(err))
    }

    async leavePool(msg: Message, _: Response, onError: OnErrorFx) {
        const props = {
            playerId: msg.data.player.id,
        }
        const validator = new ZodValidator<
            z.infer<typeof VALID_LEAVE_POOL>
                >(VALID_LEAVE_POOL)
        const {data, error} = validator.validate(props)
        if(error) {
            onError(new Error(validator.getErrMessage(error)))
            return
        }

        await this._matchService
            .leavePool(data.playerId)
            .catch(err => onError(err))
    }

    async matchmake(
        onMatched: (connectionId: string, payload: object) => void
    ) {
        await this._matchService.matchmake(onMatched)
            .catch(err => {
                console.log(err)
            })
    }
}