import { CardSet } from "./card";
import { Deck } from "./deck";
import { TrumpSet } from "./trump/set";

export class PlayerState {
    private _cards: CardSet
    private _trumps: TrumpSet

    constructor(
        private _hp: number,
        private _bet: number,
        deck: Deck
    ) {
        this._cards = new CardSet(deck)
        this._trumps = new TrumpSet()
    }

    view() {
        return {
            hp: this._hp,
            bet: this._bet,
            trumps: this._trumps.view(),
            cards: this._cards.view(),        
        }
    }
    
    /** Sets a new bet for a player by adding `delta` value. The new bet won't be
     * lower than 1.
     * 
     * @param delta - The amount of bet should be added. Negative values will reduce the bet instead.
     */
    setBet(delta: number) {
        this._bet = this._bet + delta < 1? 1: this._bet + delta
    }

    lose() {
        this._hp -= this._bet
    }

    /** Reset the state for the next round preparation.
     * 
     * @param deck 
     */
    onNextRound(deck: Deck) {
        this._bet++
        this._cards = new CardSet(deck)
        this.trumps.clearOnTable()
    }

    get cards(): PlayerState["_cards"] {return this._cards}
    get trumps(): PlayerState["_trumps"] {return this._trumps}
    get hp(): PlayerState["_hp"] {return this._hp}
    get bet(): PlayerState["_bet"] {return this._bet}

}