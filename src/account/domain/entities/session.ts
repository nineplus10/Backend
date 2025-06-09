import { Entity } from "_lib/Domain/Entity";

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

    get playerId(): SessionProps["playerId"] {return this._props.playerId}
    get origin(): SessionProps["origin"] {return this._props.origin}
    get userAgent(): SessionProps["userAgent"] {return this._props.userAgent}
    get token(): SessionProps["token"] {return this._props.token}
    get issuedAt(): SessionProps["issuedAt"] {return this._props.issuedAt}
    get revokedAt(): SessionProps["revokedAt"] | undefined {return this._props.revokedAt}
}