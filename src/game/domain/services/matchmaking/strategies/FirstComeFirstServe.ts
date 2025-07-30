import { Player } from "game/domain/values/player";
import { MatchmakingStrategy } from ".";

export class FirstComeFirstServe implements MatchmakingStrategy {
    match(players: Player[]): Player[] {
        return players;
    }
}