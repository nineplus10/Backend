import { Player } from "gameClient/domain/entities/player";
import { MatchmakingStrategy } from "./strategies";
import { Match } from "gameClient/domain/match";

export class Matchmaker {
    constructor(
        private readonly matcher: MatchmakingStrategy
    ) {}

    find(players: Player[]): Match[] {
        if(players.length % 2 !== 0) {
            throw new Error( "Couldn't matchmake with odd number of player batch")
        }

        const candidates = this.matcher.match(players)
        const matches = new Array(players.length / 2)
        for(let idx = 0; idx < players.length; idx += 2) {
            matches[idx / 2] = Match.create({
                player1: candidates[idx],
                player2: candidates[idx + 1],
                start: new Date()
            })
        }

        return matches

    }
}