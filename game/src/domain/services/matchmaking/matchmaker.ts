import { Match } from "../../values/match.ts"
import { Player } from "../../values/player.ts"
import { MatchmakingStrategy } from "./strategies/index.ts"

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