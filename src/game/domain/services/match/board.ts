import { Card, Deck } from "./deck"
import { Trump } from "./trumps"

export type Player = "1" | "2"

type PlayerInfo = {
    hp: number,
    bet: number,
    trumps: {
        onBoard: Trump[]
        inHand: Trump[]
    }
    cards: {
        faceDown: Card,
        faceUp: Card[]
    }
}

export class Board {
    private _cap: number
    private _round: number
    private _deck: Deck
    private _player1: PlayerInfo
    private _player2: PlayerInfo

    constructor() {
        this._cap = 21
        this._round = 1
        this._deck = new Deck()
        const [card1, card2] = [ this._deck.draw()!, this._deck.draw()! ]

        this._player1 = { 
            hp: 10,
            bet: this._round,
            trumps: {
                onBoard: [],
                inHand: []
            },
            cards: {
                faceDown: card1,
                faceUp: []
            },
        }
        this._player2 =  {
            hp: 10,
            bet: this._round,
            trumps: {
                onBoard: [],
                inHand: []
            },
            cards: {
                faceDown: card2,
                faceUp: []
            },
        }
    }

    /** Ends current round and prepares the next round */
    advance() {
        // Find the loser
        const sumP1 = 
            this._player1.cards.faceUp.reduce(
                (acc, c) => acc + c,
                this._player1.cards.faceDown)
        const sumP2 = 
            this._player2.cards.faceUp.reduce(
                (acc, c) => acc + c,
                this._player2.cards.faceDown)

        let loser;
        if(sumP1 > this._cap && sumP2 > this._cap) {
            loser = (sumP1 > sumP2)? this._player1 : this._player2
        } else if(sumP1 > this._cap) {
            loser = this._player2
        } else if(sumP2 > this._cap) {
            loser = this._player1
        } else {
            loser = (sumP1 > sumP2)? this._player2 : this._player1
        }
        loser.hp -= loser.bet

        // Prepare for the next round
        this._cap = 21
        this._round++
        this._deck = new Deck()
        const [card1, card2] = [ this._deck.draw()!, this._deck.draw()! ]

        this._player1.bet = this._round
        this._player1.trumps.onBoard = []
        this._player1.cards.faceDown = card1,
        this._player1.cards.faceUp = []

        this._player2.bet = this._round
        this._player2.trumps.onBoard = []
        this._player2.cards.faceDown = card2
        this._player2.cards.faceUp = []
    }

    /** Sets cap for current round.
     * 
     * @param c - The new target. The value should be between 1 to 66
     */
    setCap(c: number) {
        if(c < 1 || c > 66) // TODO: Add error definition since the error would likely be triggered by the dev
            throw new Error("New target should be between 0 and 66") 
        this._cap = c
    }

    /** Draws certain card for a player. If the deck is empty or the card passed
     * wasn't found, do nothing.
     * 
     * @param player - Player to draw the card for
     * @param card  - The name of the card. If `undefined`, a random card would be drawn instead
     * @returns 
     */
    draw(player: Player, card?: Card) {
        const target = (player === "1")? this._player1: this._player2
        const drawnCard = card? this.deck.find(card): this.deck.draw()

        if(drawnCard)
            target.cards.faceUp.push(drawnCard)
    }

    /**
     * Discards certain card from a player. If there are no face-up cards or the card
     * wasn't found in player's hand, do nothing.
     * 
     * @param player - Player to discard a card from
     * @param card - The name of the card. If `undefined`, the last-drawn card would be discarded instead
     */
    discard(player: Player, card?: Card) {
        const target = (player === "1")? this._player1 : this._player2
        const targetDeck = target.cards.faceUp
        let discardedCard: Card | undefined

        if(card) {
            let idx = 0; 
            for(;idx < targetDeck.length; idx++) {
                if(targetDeck[idx] === card)
                    break
            }

            const cardFound = idx < targetDeck.length
            discardedCard = cardFound? targetDeck[idx] : undefined
            target.cards.faceUp = 
                cardFound 
                    ? [...targetDeck.slice(0, idx), ...targetDeck.slice(idx + 1) ]
                    : targetDeck
        } else {
            discardedCard = targetDeck.pop()
        }
         
        if(discardedCard)
            this.deck.return(discardedCard)
    }

    get deck(): typeof this._deck { return this._deck}
    get player1(): typeof this._player1 { return this._player1 }
    get player2(): typeof this._player2 { return this._player2 }
}