import { Entity } from "_lib/domain/entity";
import { Player } from "./player";

interface MatchResultProps {
    winner: Player
    gameLog: string
    chatLog: string
    end: Date
}

export class MatchResult extends Entity<MatchResultProps> {
    private constructor(props: MatchResultProps, id?: number) {
        super(props, id)
    }

    static create(props: MatchResultProps, id?: number) {
        // TODO: Add domain validation

        return new MatchResult(props, id)
    }

    get winner(): MatchResultProps["winner"] {return this._props.winner}
    get gameLog(): MatchResultProps["gameLog"] {return this._props.gameLog}
    get chatLog(): MatchResultProps["chatLog"] {return this._props.chatLog}
    get end(): MatchResultProps["end"] {return this._props.end}
}