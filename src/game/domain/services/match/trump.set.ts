import { Trump } from "./trump";
import { TrumpList } from "./trump.list";

export class TrumpSet {
    static MAX_INHAND = 8;
    static pool: Trump[] = [ // TODO: probability-based pool
        TrumpList.GoFor17,
        TrumpList.GoFor24,
        TrumpList.GoFor27,
        TrumpList.Remove,
        TrumpList.Return,
        TrumpList.Shield,
        TrumpList.ShieldPlus
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
