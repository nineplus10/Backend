import { Game, PlayerReference } from "./game.ts";
import { Trump } from "./trump.ts";

class GoFor17 implements Trump {
    apply(_: PlayerReference, b: Game): void {
        b.setCap(17)
    }

    explain(): { name: string; description: string; } {
        return {
            name: "Go For 17",
            description: "Sets the cap for current round to 17"
        }       
    }
}

class GoFor24 implements Trump {
    apply(_: PlayerReference, b: Game): void {
        b.setCap(24)
    }

    explain(): { name: string; description: string; } {
        return {
            name: "Go For 24",
            description: "Sets the cap for current round to 24"
        }
    }
}

/** Sets the cap for current game to 27 */
class GoFor27 implements Trump {
    apply(_: PlayerReference, b: Game): void {
        b.setCap(27)
    }

    explain(): { name: string; description: string; } {
        return {
            name: "Go For 27",
            description: "Sets the cap for current round to 27"
        }
    }
}

/** Reduces the bet for the `applier` by 1 */
class Shield implements Trump {
    apply(applier: PlayerReference, b: Game): void {
        const target = (applier === "1")? b.player1: b.player2
        target.setBet(-1)
    }

    explain(): { name: string; description: string; } {
        return {
            name: "Shield",
            description: "Reduces your bet by 1"
        }
    }
}

/** Reduces the bet for the `applier` by 2 */
class ShieldPlus implements Trump {
    apply(applier: PlayerReference, b: Game): void {
        const target = (applier === "1")? b.player1: b.player2
        target.setBet(-2)
    }

    explain(): { name: string; description: string; } {
        return {
            name: "Shield+",
            description: "Reduces your bet by 2"
        }
    }
}

/** Removes the last up-facing card drawn by opponent and returns it to deck */
class Remove implements Trump {
    apply(applier: PlayerReference, b: Game): void {
        const target = (applier === "1")? b.player2: b.player1
        target.cards.discard()
    }

    explain(): { name: string; description: string; } {
        return {
            name: "Remove",
            description: "Returns the last face-up card drawn by your opponent to the deck"
        }
    }
}

/** Removes the last up-facing card drawn by `applier` and returns it to deck */
class Return implements Trump {
    apply(applier: PlayerReference, b: Game): void {
        const target = (applier === "1")? b.player1: b.player2
        target.cards.discard()
    }

    explain(): { name: string; description: string; } {
        return {
            name: "Return",
            description: "Return your last drawn face-up card to the deck"
        }
    }
}

export const TrumpList = {
    GoFor17: new GoFor17(),
    GoFor24: new GoFor24(),
    GoFor27: new GoFor27(),
    Remove: new Remove(),
    Return: new Return(),
    Shield: new Shield(),
    ShieldPlus: new ShieldPlus(),
}