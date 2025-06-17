import { ZodValidator } from "_lib/Validator/zod"
import { WebsocketMessage, WebsocketOnError, WebsocketResponse } from "gameClient/_lib/Websocket"
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

    async joinPool(
        payload: WebsocketMessage, 
        _: WebsocketResponse,
        onError: WebsocketOnError
    ) {
        const props = {
            playerId: payload.data.playerId,
            wins: payload.data.wins,
            gamePlayed: payload.data.gamePlayed
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

    async leavePool(
        payload: WebsocketMessage, 
        _: WebsocketResponse,
        onError: WebsocketOnError
    ) {
        const props = {
            playerId: payload.data.playerId,
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