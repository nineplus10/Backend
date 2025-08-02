import { Value } from "@nineplus10/lib/src/domain/value.ts"
import { MatchResult } from "./matchResult.ts"
import { Player } from "./player.ts"

interface MatchProps {
    player1: Player
    player2: Player
    result?: MatchResult

    start: Date
}

export class Match extends Value<MatchProps> {
    private constructor(props: MatchProps) {
        super(props)
    }

    static create(props: MatchProps) {
        if(props.player1 === props.player2)
            throw new Error("Player shouldn't fight against themselves")

        const winnerNotFromMatch = 
            props.result
            && ![props.player1, props.player2].includes(props.result.winner)
        if(winnerNotFromMatch)
            throw new Error("Winner should be either one of the players of this match")

        return new Match(props)
    }

    get player1(): MatchProps["player1"] {return this._props.player1}
    get player2(): MatchProps["player2"] {return this._props.player2}
}