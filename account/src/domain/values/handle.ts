import { Value } from "@nineplus10/lib/src/domain/value.js";
import { AppErr, AppError } from "@nineplus10/lib/src/error/application.js";
import { ZodValidator } from "@nineplus10/lib/src/validation/zod.js";
import { z } from "zod";

interface HandleProps {
    name: string
}


export class Handle extends Value<HandleProps> {
    private constructor(props: HandleProps) {
        super(props)
    }

    toJSON() {
        return this._props.name
    }

    static create(name: string) {
        const props = { name: name }

        const CRITERION = z.object({ name: z.string().max(31) })
        const validator = new ZodValidator<
            z.infer<typeof CRITERION>
                >(CRITERION)
        const {data, error} = validator.validate(props)
        if(error)
            throw new AppError(
                AppErr.BadValues,
                validator.getErrMessage(error))

        return new Handle(data)
    }

    get name(): HandleProps["name"] {return this._props.name}
}