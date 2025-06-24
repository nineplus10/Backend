import { Player } from "gameClient/domain/entities/player";
import { Match } from "gameClient/domain/match";

export interface Matchmaker {
    do(players: Player[]): Match[]
}