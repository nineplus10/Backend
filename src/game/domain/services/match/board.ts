import { CardSet } from "./card"
import { Deck } from "./deck"
import { Trump, TrumpSet } from "./trump"

export type Player = "1" | "2"

type PlayerInfo = {
    hp: number,
    bet: number,
    trumps: TrumpSet,
    cards: CardSet 
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
        this._player1 = { 
            hp: 10,
            bet: this._round,
            trumps: new TrumpSet(),
            cards: new CardSet(this.deck)        
        }
        this._player2 =  {
            hp: 10,
            bet: this._round,
            trumps: new TrumpSet(),
            cards: new CardSet(this.deck)
        }
    }

    /** Ends current round and prepares the next round */
    advance() {
        // Find the loser
        let loser;
        const sumP1 = this._player1.cards.sum()
        const sumP2 = this._player2.cards.sum()
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

        this._player1.bet = this._round
        this._player1.cards = new CardSet(this.deck)
        this._player1.trumps.clear()

        this._player2.bet = this._round
        this._player2.cards = new CardSet(this.deck)
        this._player2.trumps.clear()
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

    /** Sets a new bet for a player by adding `delta` value. The new bet won't be
     * lower than 1.
     * 
     * @param player - Player to set the bet
     * @param delta - The amount of bet should be added. Negative values will reduce the bet instead.
     */
    setBet(player: Player, delta: number) {
        const target = (player === "1")? this._player1 : this._player2
        target.bet = target.bet + delta < 1? 1: target.bet + delta
    }

    get cap(): typeof this._cap { return this._cap }
    get round(): typeof this._round { return this._round }
    get deck(): typeof this._deck { return this._deck }
    get player1(): typeof this._player1 { return this._player1 }
    get player2(): typeof this._player2 { return this._player2 }
}