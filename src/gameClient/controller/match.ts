import { ZodValidator } from "_lib/Validator/zod"
import { Message, OnErrorFx, Response } from "gameClient/_lib/Websocket"
import { MatchService } from "gameClient/services/match"
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
        private readonly _matchService: MatchService
    ) {}

    async joinPool(msg: Message, _: Response, onError: OnErrorFx) {
        const props = {
            playerId: msg.data.playerId,
            wins: msg.data.wins,
            gamePlayed: msg.data.gamePlayed
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
            .then(_ => {})
            .catch(err => onError(err))
    }

    async leavePool(msg: Message, _: Response, onError: OnErrorFx) {
        const props = {
            playerId: msg.data.playerId,
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
            .then(_ => {})
            .catch(err => onError(err))
    }
}