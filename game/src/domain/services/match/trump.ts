import { Game, PlayerReference } from "./game.ts"

type TrumpInfo = {
    name: string,
    description: string
}

export interface Trump {
    apply(applier: PlayerReference, b: Game): void
    explain(): TrumpInfo
}