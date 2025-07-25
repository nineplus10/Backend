import { Value } from "_lib/domain/value";
import { AppErr, AppError } from "_lib/error/application";
import { ZodValidator } from "_lib/validation/zod";
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