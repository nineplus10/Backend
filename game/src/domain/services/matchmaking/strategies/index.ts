import { Player } from "../../../values/player.ts";

export interface MatchmakingStrategy {
    match(players: Player[]): Player[]
}