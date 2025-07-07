import { Player } from "gameClient/domain/entities/player";
import { MatchmakingStrategy } from ".";

export class FirstComeFirstServe implements MatchmakingStrategy {
    match(players: Player[]): Player[] {
        return players;
    }
}