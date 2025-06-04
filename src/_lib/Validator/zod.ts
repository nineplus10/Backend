import { ZodError, ZodObject, ZodSchema } from "zod";
import { Validator } from "./index.ts";

export class ZodValidator<T> implements Validator<T, ZodError> {
    constructor(
        public readonly schema: ZodSchema
    ) {
    }

    public validate(val: any): {data: T, error?: ZodError<any>} {
        const {success, data, error} = this.schema.safeParse(val)
        return {data, error}
    }

    public getErrMessage(error: ZodError<any>): string {
        let msg = "";
        if(this.schema instanceof ZodObject) {
            let counter = 1
            const errMsg: string[] = []
            const fErr = error.flatten()

            Object.keys(fErr.fieldErrors).forEach(k => {
                fErr.fieldErrors[k]?.forEach(e => {
                    errMsg.push(`(${counter}) ${k}: ${e}`)
                    counter++;
                })
            })

            Object.keys(fErr.formErrors).forEach(e => {
                errMsg.push(`(${counter}) ${e}`)
                counter++;
            })

            msg += errMsg.join("\n")
        } else { // For single entity
            msg += error.flatten()["formErrors"][0]
        }
        return msg;
    }
}