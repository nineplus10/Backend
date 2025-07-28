import { PlayerStats } from "game/domain/values/playerStats"

export interface MatchCache {
    getWaitingPlayers(limit: number, order?: "ASC" | "DSC"): Promise<PlayerStats[]>
    enqueue(player: PlayerStats): Promise<void>
    dequeue(...playerId: number[]): Promise<void>
}