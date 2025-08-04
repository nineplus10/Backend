import { Game } from "./game.ts"
import { PlayerReference } from "./player.ts"

type TrumpInfo = {
    name: string,
    description: string
}

export interface Trump {
    apply(applier: PlayerReference, b: Game): void
    explain(): TrumpInfo
}