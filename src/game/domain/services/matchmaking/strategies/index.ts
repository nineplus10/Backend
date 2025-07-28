import { PlayerStats } from "game/domain/values/playerStats";

export interface MatchmakingStrategy {
    match(players: PlayerStats[]): PlayerStats[]
}