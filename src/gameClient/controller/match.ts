import { WsMessage } from "gameClient/_lib/Websocket/ws"
import { WsResponse } from "./response"
import { MatchService } from "gameClient/services/match"

export class MatchController {
    constructor(
        private readonly _matchService: MatchService
    ) {}

    async joinPool(payload: WsMessage, res: WsResponse) {
        const playerId = payload.data.playerId
        if(!playerId) {
            res.status("ERR")
                .reason("Player data not included in message")
                .send()
            return
        }

        await this._matchService
            .joinPool(playerId)
            .then(_ => {})
            .catch(err => res.status("ERR").reason(err))
    }

    async leavePool(payload: WsMessage, res: WsResponse) {
        const playerId = payload.data.playerId
        if(!playerId) {
            res.status("ERR")
                .reason("Player data not included in message")
                .send()
            return
        }

        await this._matchService
            .leavePool(playerId)
            .then(_ => {})
            .catch(err => res.status("ERR").reason(err))
    }
}