import { Game } from "./game.ts"
import { PlayerReference } from "./player.ts"

export interface Action {
    doOn(g: Game): void
    actor(): PlayerReference
}