import { Value } from "_lib/domain/value";
import { AppErr, AppError } from "_lib/error/application";
import { ZodValidator } from "_lib/validation/zod";
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