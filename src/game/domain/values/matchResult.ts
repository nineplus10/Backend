import { Player } from "./player";
import { Value } from "_lib/domain/value";

interface MatchResultProps {
    winner: Player
    gameLog: string
    chatLog: string
    end: Date
}

export class MatchResult extends Value<MatchResultProps> {
    private constructor(props: MatchResultProps) {
        super(props)
    }

    static create(props: MatchResultProps) {
        // TODO: Add domain validation

        return new MatchResult(props)
    }

    get winner(): MatchResultProps["winner"] {return this._props.winner}
    get gameLog(): MatchResultProps["gameLog"] {return this._props.gameLog}
    get chatLog(): MatchResultProps["chatLog"] {return this._props.chatLog}
    get end(): MatchResultProps["end"] {return this._props.end}
}