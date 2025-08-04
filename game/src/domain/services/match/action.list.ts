import { Action } from "./action.ts";
import { Game} from "./game.ts";
import { PlayerReference } from "./player.ts";

export class Hit implements Action {
    constructor(
        private readonly _actor: PlayerReference,
    ) { }

    doOn(g: Game): void {
        const player = this._actor == "1"? g.player1: g.player2
        player.cards.draw()
    }

    actor(): PlayerReference { return this._actor }
}

export class UseTrump implements Action {
    constructor(
        private readonly _actor: PlayerReference,
        private readonly _trumpIdx: number
    ) {}

    doOn(g: Game): void {
        const player = this._actor == "1"? g.player1: g.player2
        player.trumps.use(this._trumpIdx)
    }

    actor(): PlayerReference { return this._actor }
}

export class Pass implements Action {
    constructor(
        private readonly _actor: PlayerReference
    ) {}

    doOn(g: Game): void {}
    actor(): PlayerReference { return this._actor }
}