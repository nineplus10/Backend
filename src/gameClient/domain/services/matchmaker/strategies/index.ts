import { Player } from "gameClient/domain/entities/player";

export interface MatchmakingStrategy {
    match(players: Player[]): Player[]
}