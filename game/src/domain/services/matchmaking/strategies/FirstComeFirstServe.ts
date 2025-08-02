import { Player } from "../../../values/player.ts";
import { MatchmakingStrategy } from "./index.ts";

export class FirstComeFirstServe implements MatchmakingStrategy {
    match(players: Player[]): Player[] {
        return players;
    }
}