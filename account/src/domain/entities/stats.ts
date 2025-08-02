import { Entity } from "@nineplus10/lib/src/domain/entity.js"

interface StatsProps {
    playerId: number
    wins: number
    gamePlayed: number
}

export class Stats extends Entity<StatsProps> {
    private constructor(props: StatsProps, id?: number) {
        super(props, id)
    }

    static create(props: StatsProps, id?: number) {
        // TODO: add validation
        return new Stats(props, id)
    }

    calculateWinrate() {
        return this.gamePlayed / this.wins
    }

    get playerId(): StatsProps["playerId"] {return this._props.playerId}
    get gamePlayed(): StatsProps["gamePlayed"] {return this._props.gamePlayed}
    get wins(): StatsProps["wins"] {return this._props.wins}
}