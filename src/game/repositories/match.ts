import { Match } from "game/domain/values/match"
import { PlayerStats } from "game/domain/values/playerStats"

export interface MatchCache {
    getWaitingPlayers(limit: number, order?: "ASC" | "DSC"): Promise<PlayerStats[]>
    enqueue(player: PlayerStats): Promise<void>
    dequeue(...playerId: number[]): Promise<void>

    getCurrentMatchOf(playerId: number): Promise<string | undefined>
    saveOngoingMatch(matchId: string[], match: Match[]): Promise<void>
    deleteCompletedMatch(match: Match[]): Promise<void>
}