import { Player } from "game/domain/entities/player";

export interface MatchmakingStrategy {
    match(players: Player[]): Player[]
}