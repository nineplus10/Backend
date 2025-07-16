import { Player } from "game/domain/entities/player"

export interface MatchCache {
    getWaitingPlayers(limit: number, order?: "ASC" | "DSC"): Promise<Player[]>
    enqueue(player: Player): Promise<void>
    dequeue(...playerId: number[]): Promise<void>
}