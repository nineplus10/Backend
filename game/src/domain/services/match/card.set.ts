import { Card, Deck } from "./card.deck.ts"

export class CardSet {
    private _faceDown: Card
    private _faceUp: Card[]

    constructor(
        private readonly deck: Deck
    ) {
        const initFaceDown = this.deck.draw()
        const initFaceUp = this.deck.draw()
        if(!initFaceDown || !initFaceUp)
            throw new Error("Initial deck size is not enough for initial draw")

        this._faceDown = initFaceDown
        this._faceUp = [initFaceUp]
    }

    view(): any {
        return {
            faceDown: this._faceDown,
            faceUp: this._faceUp
        }
    }

    sum(): number {
        return this._faceUp.reduce(
            (acc, c) => acc + c,
            this._faceDown
        )
    }

    /** Draws certain card. If the deck is empty or the card passed
     * wasn't found, do nothing instead.
     * 
     * @param card  - The name of the card. If omitted, a random card would be drawn instead
     * @returns 
     */
    draw(c?: Card) {
        const drawnCard = c? this.deck.find(c): this.deck.draw()
        if(drawnCard)
            this._faceUp.push(drawnCard)
    }

    /**
     * Discards certain card. If there are no face-up cards or the card
     * wasn't found, do nothing instead.
     * 
     * @param c - The name of the card. If `undefined`, the last-drawn card would be discarded instead
     */
    discard(c?: Card) {
        const targetDeck = this._faceUp
        let discardedCard: Card | undefined

        if(c) {
            const cardIdx = targetDeck.findIndex(cd => cd == c)
            const cardFound = cardIdx < targetDeck.length
            discardedCard = cardFound? targetDeck[cardIdx] : undefined
            this._faceUp = 
                cardFound 
                    ? [...targetDeck.slice(0, cardIdx), ...targetDeck.slice(cardIdx + 1) ]
                    : targetDeck
        } else {
            discardedCard = targetDeck.pop()
        }
         
        if(discardedCard)
            this.deck.return(discardedCard)
    }

    /** Swaps a facing-up card between two `CardSet`. If either card wasn't found,
     * do nothing instead.
     * 
     * @param cs - Another CardSet
     * @param c1 - Card from first CardSet. If omitted, its last-drawn card would be used instead
     * @param c2 - Card from another Cardset. Ditto.
     */
    swapCard(cs: CardSet, c1?: Card, c2?: Card) {
        const cardsP1 = this._faceUp
        const cardsP2 = cs._faceUp
        let c1Idx = cardsP1.findIndex(c => c == c1)
        let c2Idx = cardsP2.findIndex(c => c == c2)

        if(c1Idx == -1 || c2Idx == -1)
            return

        const temp = cardsP1[c1Idx]
        cardsP1[c1Idx] = cardsP2[c2Idx]
        cardsP2[c2Idx] = temp
    }
}