import { Board, Player } from "../board";

export interface Trump {
    apply(applier: Player, b: Board): void
}