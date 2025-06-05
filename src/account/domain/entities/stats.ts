import { Entity } from "_lib/Domain/Entity"

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

    get playerId(): number {return this._props.playerId}
    get gamePlayed(): number {return this._props.gamePlayed}
    get wins(): number {return this._props.wins}
}