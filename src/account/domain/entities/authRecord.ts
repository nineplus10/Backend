import { accountEnv } from "account/env";
import { Entity } from "../../../_lib/Domain/Entity";

interface AuthRecordProps {
    playerId: number,
    origin: string,
    attemptedAt: Date,
    isOk: boolean
}

const MS_IN_MIN = 1000 * 60

export class AuthRecord extends Entity<AuthRecordProps>{
    private static readonly _COOLDOWN_PERIOD = accountEnv.AUTH_FAIL_COOLDOWN

    private constructor(props: AuthRecordProps, id?: number) {
        super(props, id)
    }

    static create(props: AuthRecordProps, id?: number) {
        // TODO: Validation...

        return new AuthRecord(props, id)
    }

    getCooldown(): number {
        const timeElapsed = (new Date()).valueOf() - this.attemptedAt.valueOf()
        const diff =  AuthRecord._COOLDOWN_PERIOD - timeElapsed
        return diff > 0? Math.floor(diff / MS_IN_MIN) : 0
    }

    get isOk(): AuthRecordProps["isOk"] {return this._props.isOk}
    get attemptedAt(): AuthRecordProps["attemptedAt"] {return this._props.attemptedAt}
    get origin(): AuthRecordProps["origin"] {return this._props.origin}
    get playerId(): AuthRecordProps["playerId"] {return this._props.playerId}
}