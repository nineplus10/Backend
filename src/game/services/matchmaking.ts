import { PlayerStats } from "game/domain/values/playerStats";
import { MatchCache } from "game/repositories/match";
import { Matchmaker } from "game/domain/services/matchmaking/matchmaker";
import { Cache } from "_lib/websocket";
import { MatchManager } from "game/domain/services/match/manager";

const attemptSkipCap = 10

export class MatchmakingService {
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
        const player = PlayerStats.create({
            playerId: playerId,
            gamePlayed: gamePlayed, 
            wins: wins
        })
        await this._matchCache.enqueue(player)
    }

    async leavePool(...playerId: number[]): Promise<void> {
        await this._matchCache.dequeue(...playerId)
    }

    async matchmake(
        onMatched: (conn1: string, conn2: string, roomName: string) => void
    ): Promise<void> {
        const 
            reducerCoef = 1 / (this._attemptSkipped + 1),
            N_MAX_PLAYER_PER_BATCH = 1000,
            N_MINIMUM_PLAYER_PER_BATCH = 
                this._attemptSkipped == attemptSkipCap
                    ? 2 
                    : Math.floor(50 * reducerCoef)

        const players = await this._matchCache.getWaitingPlayers(N_MAX_PLAYER_PER_BATCH)
        if(players.length < N_MINIMUM_PLAYER_PER_BATCH) {
            if(this._attemptSkipped < attemptSkipCap)
                this._attemptSkipped++
            return
        } 
        this._attemptSkipped = 0
        
        const endIdx = Math.floor(players.length / 2) * 2
        const matches = this._matchMaker.find(players.slice(0, endIdx))

        const matchCandidates: number[] = []
        matches.forEach(m => matchCandidates.push(m.player1.playerId, m.player2.playerId))
        const connections = await this._websocketCache.find(...matchCandidates)

        // Disconnected player would not have their record stored on cache. A 
        // player that got matched with them should not be dequeued
        const matchedPlayers: number[] = []
        for(let idx = 0; idx < connections.length / 2; idx++) {
            const connPlayer1 = connections[idx]
            const connPlayer2 = connections[idx + 1]
            if(!connPlayer1 || !connPlayer2) continue

            const match = matches[idx]
            const roomId = this._matchManager.init(match)
            onMatched(connPlayer1, connPlayer2, roomId)
            matchedPlayers.push(match.player1.playerId, match.player2.playerId)
        }

        await this.leavePool(...matchedPlayers)
    }
}