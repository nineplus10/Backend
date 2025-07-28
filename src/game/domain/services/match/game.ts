import { Deck } from "./card.deck"
import { PlayerState } from "./player"

export type PlayerReference = "1" | "2"

export class Game {
    private _cap: number
    private _round: number
    private _deck: Deck
    private _player1: PlayerState
    private _player2: PlayerState

    constructor() {
        this._cap = 21
        this._round = 1
        this._deck = new Deck()
        this._player1 = new PlayerState(10, this._round, this._deck)
        this._player2 = new PlayerState(10, this._round, this._deck)
    }

    /** Returns the current board with modification based on who will view them.
     * 
     * @param viewer - The viewer of the board. `1` and `2` means `player1` and `player2` respectively
     * while `0` means public.
     */
    view(viewer: PlayerReference | "0") {
        const board = {
            cap: this._cap,
            round: this._round,
            player1: this._player1.view(),
            player2: this._player2.view(),
        }

        if(viewer === "0")
            return board

        const opposingPlayer = viewer == "1"? board.player2: board.player1
        opposingPlayer.trumps.inHand = []
        opposingPlayer.cards.faceDown = undefined!
        return board
    }

    /** Ends current round and prepares the next round */
    advance() {
        let loser: PlayerState;
        const sumP1 = this._player1.cards.sum()
        const sumP2 = this._player2.cards.sum()

        if(sumP1 === sumP2) {
            return
        } else if(sumP1 > this._cap && sumP2 > this._cap) {
            loser = (sumP1 > sumP2)? this._player1 : this._player2
        } else if(sumP1 > this._cap) {
            loser = this._player1
        } else if(sumP2 > this._cap) {
            loser = this._player2
        } else {
            loser = (sumP1 > sumP2)? this._player2 : this._player1
        }
        loser.lose()

        this._cap = 21
        this._round++
        this._deck = new Deck()
        this._player1.onNextRound(this.deck)
        this._player2.onNextRound(this.deck)
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

    get cap(): typeof this._cap { return this._cap }
    get round(): typeof this._round { return this._round }
    get deck(): typeof this._deck { return this._deck }
    get player1(): typeof this._player1 { return this._player1 }
    get player2(): typeof this._player2 { return this._player2 }
}