import { z } from "zod"
import { Message, OnErrorFx, Response } from "@nineplus10/lib/src/websocket/index.ts"
import { AppErr, AppError } from "@nineplus10/lib/src/error/application.ts"
import { MatchService } from "../services/match.ts"
import { ZodValidator } from "@nineplus10/lib/src/validation/zod.ts"

const JOIN_POOL_MSG = z.object({
    playerId: z.coerce.number(),
    wins: z.coerce.number(),
    gamePlayed: z.coerce.number()
})

const LEAVE_POOL_MSG = z.object({
    playerId: z.coerce.number()
})

const JOIN_MATCH_MSG = z.object({
    roomId: z.string().optional(),
    playerId: z.coerce.number(),
})

const DO_ACTION_MSG = z.object({
    roomId: z.string(),
    playerId: z.coerce.number(),
    actionName: z.union([
        z.literal("HIT"),
        z.literal("PASS"),
        z.literal("USETRUMP"),
    ])
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
            (conn1: string, conn2: string, roomId: string) => {
                const payload = { roomId: roomId }
                onMatched(conn1, payload)
                onMatched(conn2, payload)
            })
            .catch(err => {
                console.log(err)
            })
    }

    async joinMatch(msg: Message, _: Response, onError: OnErrorFx) {
        const props = {
            roomId: msg.data.roomId, 
            playerId: msg.data.player.id,
        }
        const validator = new ZodValidator<
            z.infer<typeof JOIN_MATCH_MSG>
                >(JOIN_MATCH_MSG)
        const {data, error} = validator.validate(props)
        if(error) {
            onError(new AppError(
                AppErr.BadRequest,
                validator.getErrMessage(error)))
            return
        }
            
        await this._matchService.joinRoom(data.playerId, data.roomId)
            .catch(err => onError(err))
    }

    async doActionInMatch(msg: Message, _: Response, onError: OnErrorFx) {
        const props = {
            roomId: msg.data.roomId,
            playerId: msg.data.player.id,
            actionName: msg.data.actionName
        }
        const validator = new ZodValidator<
            z.infer<typeof DO_ACTION_MSG>
                >(DO_ACTION_MSG)
        const {data, error} = validator.validate(props)
        if(error) {
            onError(new AppError(
                AppErr.BadRequest,
                validator.getErrMessage(error)))
            return
        }

        // Stinks, but the usecase kinda stable for now so... let's keep it
        let actionProps: any
        if(data.actionName == "USETRUMP") { 
            if(msg.data.trumpIdx === undefined) {
                onError(new AppError(
                    AppErr.BadRequest,
                    "To use trump, specify which trump to use"))
                return
            }
            actionProps = { trumpIdx: msg.data.trumpIdx }
        }
        this._matchService.doAction(
            data.playerId,
            data.roomId,
            data.actionName,
            actionProps
        )
    }
}