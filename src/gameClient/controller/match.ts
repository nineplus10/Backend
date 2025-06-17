import { WebsocketMessage, WebsocketResponse } from "gameClient/_lib/Websocket"
import { MatchService } from "gameClient/services/match"

export class MatchController {
    constructor(
        private readonly _matchService: MatchService
    ) {}

    async joinPool(payload: WebsocketMessage, res: WebsocketResponse) {
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

    async leavePool(payload: WebsocketMessage, res: WebsocketResponse) {
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