import { Value } from "_lib/Domain/Value";
import { DomainErr, DomainError } from "_lib/Error/DomainError";
import { ZodValidator } from "_lib/Validator/zod";
import { z } from "zod";

interface EmailProps {
    email: string
}

export class Email extends Value<EmailProps> {
    private constructor(props: EmailProps) {
        super(props)
    }

    toJSON() {
        return this._props.email
    }

    static create(email: string) {
        const props = { email: email }

        const CRITERION = z.object({ email: z.string().email().max(63) })
        const validator = new ZodValidator<
            z.infer<typeof CRITERION>
                >(CRITERION)
        const {data, error} = validator.validate(props)
        if(error)
            throw new DomainError(
                DomainErr.InvalidValue,
                validator.getErrMessage(error))

        return new Email(data)
    }

    get email(): string { return this._props.email }
}