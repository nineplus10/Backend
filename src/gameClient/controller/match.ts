import { ZodValidator } from "_lib/Validator/zod"
import { Message, OnErrorFx, Response } from "_lib/Websocket"
import { MatchService } from "gameClient/services/match"
import { WebsocketCache } from "gameClient/repository/websocket";
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
        // private readonly _websocketCache: WebsocketCache,
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

    // async matchmake(
    //     onMatched: (connectionId: string, payload: object) => void
    // ) {
    //     const matches = await this._matchService.matchmake()
    //     const matchCandidates: number[] = []
    //     matches.forEach(m => matchCandidates.push(m.player1.id!, m.player2.id!))

    //     await this._websocketCache
    //         .find(...matchCandidates)
    //         .then(connections => {
    //             // Handle case when one of the player happens to be disconnected or
    //             // their connection data is missing after the match candidates has 
    //             // been found. When that happens, their opponent should not 
    //             // be dequeued from the matchmaking queue
    //             const matchedPlayers: number[] = []
    //             for(let idx = 0; idx < connections.length / 2; idx++) {
    //                 const connPlayer1 = connections[idx]
    //                 const connPlayer2 = connections[idx + 1]
    //                 if(!connPlayer1 || !connPlayer2) continue

    //                 onMatched(connPlayer1, {})
    //                 onMatched(connPlayer2, {})

    //                 const {player1, player2} = matches[idx]
    //                 matchedPlayers.push(player1.id!, player2.id!)
    //             }

    //             return this._matchService.leavePool(...matchedPlayers)
    //         })
    //         .catch(err => {
    //             console.log(err)
    //         })
    // }
}