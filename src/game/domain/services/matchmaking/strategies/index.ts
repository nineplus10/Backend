import { Player } from "game/domain/values/player";

export interface MatchmakingStrategy {
    match(players: Player[]): Player[]
}