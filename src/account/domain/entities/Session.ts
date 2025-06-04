import { Entity } from "_lib/Domain/_Entity";

interface SessionProps {
    playerId: number
    origin: string,
    userAgent: string,
    token: string,
    issuedAt: Date,
    revokedAt?: Date,
}

export class Session extends Entity<SessionProps> {
    private constructor(props: SessionProps, id?: number) {
        super(props, id)
    }

    static create(props: SessionProps, id?: number) {
        // TODO: Validation...
        return new Session(props, id)
    }

    get playerId(): number {return this._props.playerId}
    get origin(): string {return this._props.origin}
    get userAgent(): string {return this._props.userAgent}
    get token(): string {return this._props.token}
    get issuedAt(): Date {return this._props.issuedAt}
    get revokedAt(): Date | undefined {return this._props.revokedAt}
}