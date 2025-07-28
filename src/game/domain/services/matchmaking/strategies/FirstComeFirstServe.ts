import { PlayerStats } from "game/domain/values/playerStats";
import { MatchmakingStrategy } from ".";

export class FirstComeFirstServe implements MatchmakingStrategy {
    match(players: PlayerStats[]): PlayerStats[] {
        return players;
    }
}