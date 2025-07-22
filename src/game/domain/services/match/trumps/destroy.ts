import { ImmediateTrump } from ".";
import { Board, Player } from "../board";

class Destroy extends ImmediateTrump {
    apply(applier: Player, board: Board): void { 

    }
}

class DestroyPlus extends ImmediateTrump {
    apply(applier: Player, board: Board): void { }
}

class DestroyPlusPlus extends ImmediateTrump {
    apply(applier: Player, board: Board): void { }
}