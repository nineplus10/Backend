import { Board, PlayerReference } from "../board";

type TrumpInfo = {
    name: string,
    description: string
}

export interface Trump {
    apply(applier: PlayerReference, b: Board): void
    explain(): TrumpInfo
}