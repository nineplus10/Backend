import { Trump } from ".";
import { Board, Player } from "../board";

export class GoFor17 implements Trump {
    apply(_: Player, b: Board): void {
        b.setCap(17)
    }
}

export class GoFor24 implements Trump {
    apply(_: Player, b: Board): void {
        b.setCap(24)
    }
}

export class GoFor27 implements Trump {
    apply(_: Player, b: Board): void {
        b.setCap(27)
    }
}