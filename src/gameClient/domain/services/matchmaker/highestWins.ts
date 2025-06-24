import { Player } from "gameClient/domain/entities/player";
import { Matchmaker } from ".";
import { Match } from "gameClient/domain/match";
import { DomainErr, DomainError } from "_lib/Error/DomainError";

export class HighestWinsMatchmaker implements Matchmaker {
    private sort(players: Player[]): Player[] {
        if(players.length == 1) {
            return players
        } else if(players.length == 2) {
            return players[0].wins > players[1].wins
                ? [players[0], players[1]]
                : [players[1], players[0]]
        } 
        
        const 
            lhs = this.sort(players.slice(0, players.length / 2)),
            rhs = this.sort(players.slice(players.length / 2)),
            sortedPlayers = new Array(players.length)
        let
            lIdx = 0,
            rIdx = 0,  
            sIdx = 0

        while(lIdx + rIdx < players.length) {
            if(lhs[lIdx].wins > rhs[rIdx].wins) {
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

    do(players: Player[]): Match[] {
        if(players.length % 2 !== 0) {
            throw new DomainError(
                DomainErr.InvalidValue,
                "Couldn't matchmake with odd number of player batch")
        }

        const candidates = this.sort(players)
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