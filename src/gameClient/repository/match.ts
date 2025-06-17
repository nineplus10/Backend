import { Player } from "gameClient/domain/entities/player"
import { Match } from "gameClient/domain/match"

export interface MatchCache {
    getMany(limit: number): Promise<Match[]>
    addPlayer(player: Player): Promise<void>
    removePlayer(player: Player): Promise<void>
}