import { Player } from "game/domain/entities/player";
import { MatchmakingStrategy } from ".";

export class FirstComeFirstServe implements MatchmakingStrategy {
    match(players: Player[]): Player[] {
        return players;
    }
}