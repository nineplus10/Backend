export enum Card {
    One = 1,
    Two = 2,
    Three = 3,
    Four = 4,
    Five = 5,
    Six = 6,
    Seven = 7,
    Eight = 8,
    Nine = 9,
    Ten = 10,
    Eleven = 11
}

export class Deck {
    private deck: Card[]

    /**
     * Shuffles the deck using Fisher-Yates random algorithm. 
     * Shuffle would be done in-place.
     * 
     * @see about: https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
     * @see comparison: https://bost.ocks.org/mike/shuffle/compare.html
     */
    private shuffle(deck: Card[]) {
        for(let endIdx = deck.length; endIdx > 0; endIdx--) {
            const newIdx = Math.floor(Math.random() * endIdx)
            const endEle = deck[endIdx]
            deck[endIdx] = deck[newIdx]
            deck[newIdx] = endEle
        }
    }

    constructor() {
        const deck = [
            Card.One, Card.Two, Card.Three, Card.Four, Card.Five, Card.Six, 
            Card.Seven, Card.Eight, Card.Nine, Card.Ten, Card.Eleven ]
        this.shuffle(deck)
        this.deck = deck
    }

    find(c: Card): number | undefined {
        for(let idx = 0; idx < this.deck.length; idx++) {
            if(this.deck[idx] == c) 
                return idx
        }
        return undefined
    }

    draw(): Card | undefined {
        return this.deck.pop()
    }

    pick(c: Card): Card | undefined {
        const idx = this.find(c)
        let card: ReturnType<typeof this.pick>
        if(idx) {
            card = this.deck[idx]
            this.deck = [...this.deck.slice(0, idx), ...this.deck.slice(idx + 1)]
        }
        return card
    }

    return(card: Card) {
        this.deck = [...this.deck, card]
        this.shuffle(this.deck)
    }
}