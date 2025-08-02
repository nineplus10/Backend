import { Value } from "@nineplus10/lib/src/domain/value.js";
import { AppErr, AppError } from "@nineplus10/lib/src/error/application.js";
import { ZodValidator } from "@nineplus10/lib/src/validation/zod.js";
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
            throw new AppError(
                AppErr.BadValues,
                validator.getErrMessage(error))

        return new Email(data)
    }

    get email(): EmailProps["email"] { return this._props.email }
}