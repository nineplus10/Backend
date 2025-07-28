import { Trump } from ".";
import { Board, PlayerReference } from "../board";

class GoFor17 implements Trump {
    apply(_: PlayerReference, b: Board): void {
        b.setCap(17)
    }

    explain(): { name: string; description: string; } {
        return {
            name: "Go For 17",
            description: "Sets the cap for current round to 17"
        }       
    }
}

class GoFor24 implements Trump {
    apply(_: PlayerReference, b: Board): void {
        b.setCap(24)
    }

    explain(): { name: string; description: string; } {
        return {
            name: "Go For 24",
            description: "Sets the cap for current round to 24"
        }
    }
}

/** Sets the cap for current game to 27 */
class GoFor27 implements Trump {
    apply(_: PlayerReference, b: Board): void {
        b.setCap(27)
    }

    explain(): { name: string; description: string; } {
        return {
            name: "Go For 27",
            description: "Sets the cap for current round to 27"
        }
    }
}

/** Reduces the bet for the `applier` by 1 */
class Shield implements Trump {
    apply(applier: PlayerReference, b: Board): void {
        const target = (applier === "1")? b.player1: b.player2
        target.setBet(-1)
    }

    explain(): { name: string; description: string; } {
        return {
            name: "Shield",
            description: "Reduces your bet by 1"
        }
    }
}

/** Reduces the bet for the `applier` by 2 */
class ShieldPlus implements Trump {
    apply(applier: PlayerReference, b: Board): void {
        const target = (applier === "1")? b.player1: b.player2
        target.setBet(-2)
    }

    explain(): { name: string; description: string; } {
        return {
            name: "Shield+",
            description: "Reduces your bet by 2"
        }
    }
}

/** Removes the last up-facing card drawn by opponent and returns it to deck */
class Remove implements Trump {
    apply(applier: PlayerReference, b: Board): void {
        const target = (applier === "1")? b.player2: b.player1
        target.cards.discard()
    }

    explain(): { name: string; description: string; } {
        return {
            name: "Remove",
            description: "Returns the last face-up card drawn by your opponent to the deck"
        }
    }
}

/** Removes the last up-facing card drawn by `applier` and returns it to deck */
class Return implements Trump {
    apply(applier: PlayerReference, b: Board): void {
        const target = (applier === "1")? b.player1: b.player2
        target.cards.discard()
    }

    explain(): { name: string; description: string; } {
        return {
            name: "Return",
            description: "Return your last drawn face-up card to the deck"
        }
    }
}

export class TrumpSet {
    static MAX_INHAND = 8;
    static pool: Trump[] = [ // TODO: probability-based pool
        new GoFor17(),
        new GoFor24(),
        new GoFor27(),
        new Remove(),
        new Return(),
        new Shield(),
        new ShieldPlus(),
    ]

    private _inHand: Trump[]
    private _onTable: Trump[]

    constructor() {
        this._inHand = []
        this._onTable = []
        this.draw(1)
    }

    view() {
        return {
            inHand: this._inHand.map(t => t.explain()),
            onTable: this._onTable.map(t => t.explain())
        }
    }

    /** Draws trumps from hand. If `(currentTrumpCards + n) > MAX_INHAND_TRUMPS`,
     * draw until the player have `MAX_INHAND_TRUMPS` trumps instead.
     * 
     * @param n - Number of trump cards to be drawn. The default value is 1
     */
    draw(n: number) {
        const diff = this._inHand.length + n - TrumpSet.MAX_INHAND
        const actualCardsToDraw = diff < 0? n: n - diff

        for(let idx = 0; idx < actualCardsToDraw; idx++) {
            const idx = Math.floor(Math.random() * TrumpSet.pool.length)
            this._inHand.push(TrumpSet.pool[idx])
        }
    }

    /** Discards trump from hand. If `idx` is out of range, do nothing instead
     * 
     * @param idx - The index of the trump to be discarded. If omitted, it would be set as last index
     * @returns 
     */
    discard(idx?: number) {
        const actualIdx = idx ?? this._inHand.length - 1
        if(actualIdx > this._inHand.length)
            return

        this._inHand = 
            idx ? [...this._inHand.slice(0, actualIdx), ...this._inHand.slice(actualIdx + 1)]
                : this._inHand.slice(0, -2)
    }

    /** Swaps in-hand trump between `TrumpSet`
     * 
     * @param ts - Another `TrumpSet`
     * @param idx1 - Index of trump in current `TrumpSet`. If omitted, it would be set as last index
     * @param idx2 - Index of trump in another `TrumpSet`. Ditto
     * @returns 
     */
    swap(ts: TrumpSet, idx1?: number, idx2?:number) {
        const hand1 = this._inHand
        const hand2 = ts._inHand

        const t1Idx = idx1 ?? (hand1.length - 1)
        const t2Idx = idx2 ?? (hand2.length - 1)
        const idxOk = t1Idx >= 0 
                    && t1Idx < hand1.length 
                    && t2Idx >= 0
                    && t2Idx < hand2.length
        if(!idxOk) 
            return

        if(!hand1[t1Idx] || !hand2[t2Idx]) 
            return
        const temp = hand1[t1Idx]
        hand1[t1Idx] = hand2[t2Idx]
        hand2[t2Idx] = temp
    }

    clearOnTable() {
        this._onTable = []
    }

    use(idx: number): Trump | undefined {
        if(idx < 0 || idx > this._inHand.length)
            return undefined

        const trump = this._inHand[idx]
        this._inHand = [...this._inHand.slice(0, idx), ...this._inHand.slice(idx + 1)]
        this._onTable.push(trump)
        return trump
    }
}
