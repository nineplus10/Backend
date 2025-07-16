import { Entity } from "_lib/domain/entity";
import { Player } from "./entities/player";
import { MatchResult } from "./entities/matchResult";

interface MatchProps {
    player1: Player
    player2: Player
    result?: MatchResult

    start: Date
}

export class Match extends Entity<MatchProps> {
    private constructor(props: MatchProps, id?: number) {
        super(props, id)
    }

    static create(props: MatchProps, id?: number) {
        if(props.player1 === props.player2)
            throw new Error("Player shouldn't fight against themselves")

        const winnerNotFromMatch = 
            props.result
            && ![props.player1, props.player2].includes(props.result.winner)
        if(winnerNotFromMatch)
            throw new Error("Player shouldn't fight against themselves")

        return new Match(props, id)
    }

    get player1(): MatchProps["player1"] {return this._props.player1}
    get player2(): MatchProps["player2"] {return this._props.player2}
}