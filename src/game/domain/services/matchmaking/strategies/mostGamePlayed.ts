import { Player } from "game/domain/entities/player";
import { MatchmakingStrategy } from ".";

export class HighestGamePlayed implements MatchmakingStrategy {
    match(players: Player[]): Player[] {
        if(players.length == 1) {
            return players
        } else if(players.length == 2) {
            return players[0].gamePlayed > players[1].gamePlayed
                ? [players[0], players[1]]
                : [players[1], players[0]]
        } 
        
        const 
            lhs = this.match(players.slice(0, players.length / 2)),
            rhs = this.match(players.slice(players.length / 2)),
            sortedPlayers = new Array(players.length)
        let
            lIdx = 0,
            rIdx = 0,  
            sIdx = 0

        while(lIdx + rIdx < players.length) {
            if(lhs[lIdx].gamePlayed > rhs[rIdx].gamePlayed) {
                sortedPlayers[sIdx] = lhs[lIdx]
                lIdx++
            } else {
                sortedPlayers[sIdx] = rhs[rIdx]
                rIdx++
            }
            sIdx++
        }

        return sortedPlayers
    }
}
