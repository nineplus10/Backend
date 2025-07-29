import { AppErr, AppError } from "_lib/error/application"
import { ZodValidator } from "_lib/validation/zod"
import { Message, OnErrorFx, Response } from "_lib/websocket"
import { MatchService } from "game/services/match"
import { z } from "zod"

const JOIN_POOL_MSG = z.object({
    playerId: z.coerce.number(),
    wins: z.coerce.number(),
    gamePlayed: z.coerce.number()
})
const LEAVE_POOL_MSG = z.object({
    playerId: z.coerce.number()
})

const JOIN_MATCH_MSG = z.object({
    playerId: z.coerce.number(),
})

export class MatchmakingController {
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
            z.infer<typeof JOIN_POOL_MSG>
                >(JOIN_POOL_MSG)
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
            z.infer<typeof LEAVE_POOL_MSG>
                >(LEAVE_POOL_MSG)
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
        await this._matchService.matchmake(
            (conn1: string, conn2: string, roomName: string) => {
                const payload = { roomName: roomName }
                onMatched(conn1, payload)
                onMatched(conn2, payload)
            })
            .catch(err => {
                console.log(err)
            })
    }

    async joinMatch(msg: Message, _: Response, onError: OnErrorFx) {
        const props = {
            playerId: msg.data.player.id,
        }
        const validator = new ZodValidator<
            z.infer<typeof JOIN_MATCH_MSG>
                >(JOIN_MATCH_MSG)
        const {data, error} = validator.validate(props)
        if(error)
            onError(new AppError(
                AppErr.BadRequest,
                validator.getErrMessage(error)))
            
        await this._matchService.joinRoom(data.playerId)
            .catch(err => onError(err))
    }
}