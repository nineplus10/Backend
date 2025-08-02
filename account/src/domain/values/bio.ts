import { Value } from "@nineplus10/lib/src/domain/value.js";
import { AppErr, AppError } from "@nineplus10/lib/src/error/application.js";
import { ZodValidator } from "@nineplus10/lib/src/validation/zod.js";
import { z } from "zod";

interface BioProps {
    content: string
}

export class Bio extends Value<BioProps> {
    private constructor(props: BioProps) {
        super(props)
    }

    toJSON() {
        return this._props.content
    }

    static create(content: string) {
        const props = { content: content }

        const CRITERION = z.object({ content: z.string().max(255) })
        const validator = new ZodValidator<
            z.infer<typeof CRITERION>
                >(CRITERION)
        const {data, error} = validator.validate(props)
        if(error)
            throw new AppError(
                AppErr.BadValues,
                validator.getErrMessage(error))

        return new Bio(data)
    }

    get content(): BioProps["content"] {return this._props.content}
}