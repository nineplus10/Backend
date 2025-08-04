import { Cache } from "@nineplus10/lib/src/websocket/index.ts"
import { MatchCache } from "../repositories/match.ts"
import { Matchmaker } from "../domain/services/matchmaking/matchmaker.ts"
import { MatchManager } from "../domain/services/match/manager.ts"
import { AppErr, AppError } from "@nineplus10/lib/src/error/application.ts"
import { Match } from "../domain/values/match.ts"
import { Player } from "../domain/values/player.ts"
import { Action } from "../domain/services/match/action.ts"
import { Hit, Pass, UseTrump } from "../domain/services/match/action.list.ts"

const attemptSkipCap = 10
const MAX_PLAYER_PER_BATCH = 1000

export class MatchService {
    private _attemptSkipped: number
    constructor(
        private readonly _matchCache: MatchCache,
        private readonly _websocketCache: Cache,
        private readonly _matchMaker: Matchmaker,
        private readonly _matchManager: MatchManager
    ) { 
        this._attemptSkipped = 0
    }

    async joinPool(playerId: number, gamePlayed: number, wins: number): Promise<void> {
        const ongoingMatch = await this._matchCache.getCurrentMatchOf(playerId)
        if(ongoingMatch && this._matchManager.getPlayerReference(ongoingMatch, playerId))
            throw new AppError(
                AppErr.Forbidden,
                `You still have an on-going match`)

        const player = Player.create({
            id: playerId,
            gamePlayed: gamePlayed, 
            wins: wins
        })
        await this._matchCache.enqueue(player)
    }

    async leavePool(...playerId: number[]): Promise<void> {
        await this._matchCache.dequeue(...playerId)
    }

    async matchmake(
        onMatched: (conn1: string, conn2: string, roomId: string) => void
    ): Promise<void> {
        const 
            MINIMUM_PLAYER_PER_BATCH = 
                this._attemptSkipped == attemptSkipCap
                    ? 2 
                    : Math.floor(50 / (this._attemptSkipped + 1)) // base * reducerCoef

        const players = await this._matchCache.getWaitingPlayers(MAX_PLAYER_PER_BATCH)
        if(players.length < MINIMUM_PLAYER_PER_BATCH) {
            if(this._attemptSkipped < attemptSkipCap)
                this._attemptSkipped++
            return
        } 
        this._attemptSkipped = 0
        
        const endIdx = (players.length % 2 == 0)? players.length: players.length - 1
        const matches = this._matchMaker.find(players.slice(0, endIdx))

        const matchCandidates: number[] = []
        matches.forEach(m => matchCandidates.push(m.player1.id, m.player2.id))
        const connections = await this._websocketCache.find(...matchCandidates)

        // Disconnected player would not have their record stored on cache. A 
        // player that got matched with them should not be dequeued
        const matchedPlayers: number[] = []
        const roomIds: string[] = []
        const initiatedMatches: Match[] = []
        for(let idx = 0; idx < connections.length / 2; idx++) {
            const connPlayer1 = connections[idx]
            const connPlayer2 = connections[idx + 1]
            if(!connPlayer1 || !connPlayer2) continue

            const match = matches[idx]
            const roomId = this._matchManager.init(match)
            roomIds.push(roomId)
            initiatedMatches.push(match)
            matchedPlayers.push(match.player1.id, match.player2.id)

            onMatched(connPlayer1, connPlayer2, roomId)
        }

        await this.leavePool(...matchedPlayers)
        await this._matchCache.saveOngoingMatch(roomIds, matches)
    }

    async joinRoom(playerId: number, roomId?: string) {
        const actualRoomId = roomId ?? await this._matchCache.getCurrentMatchOf(playerId)
        if(actualRoomId)
            await this._matchManager.checkIn(playerId, actualRoomId)
    }

    async doAction(
        playerId: number, 
        roomId: string, 
        actionName: "HIT" | "USETRUMP" | "PASS",
        actionProp: any
    ) {
        const player = this._matchManager.getPlayerReference(roomId, playerId)
        if(!player)
            return

        // Stinks, but the usecase kinda stable for now so... let's keep it
        let action: Action
        switch(actionName) {
            case "HIT": 
                action = new Hit(player)
                break
            case "USETRUMP":
                action = new UseTrump(player, actionProp.trumpIdx)
                break
            case "PASS":
                action = new Pass(player)
                break
        }
        const actionResult = this._matchManager.doAction(roomId, action)
    }
}
