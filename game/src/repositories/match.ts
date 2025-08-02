import { Match } from "../domain/values/match.ts"
import { Player } from "../domain/values/player.ts"

export interface MatchCache {
    getWaitingPlayers(limit: number, order?: "ASC" | "DSC"): Promise<Player[]>
    enqueue(player: Player): Promise<void>
    dequeue(...playerId: number[]): Promise<void>

    getCurrentMatchOf(playerId: number): Promise<string | undefined>
    saveOngoingMatch(matchId: string[], match: Match[]): Promise<void>
    deleteCompletedMatch(match: Match[]): Promise<void>
}