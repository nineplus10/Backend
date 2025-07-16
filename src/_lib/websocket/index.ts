export interface Response {
    /**
     * Metadata of the response
     */
    meta: {
        /**
         * Tells whether this is a ok response or an error one
         */
        status: "OK" | "ERR"

        /**
         * Used in error response. This message would be delivered to the
         * client
         */
        reason?: string
    }

    /**
     * Sends the response to the client with `this.meta` and the payload
     * supplied in the parameter.
     * 
     * @param payload 
     * @returns 
     */
    send: (payload?: any) => void;

    /**
     * Sets the `status` of `this.meta`.
     * 
     * @param s 
     * @returns the instance itself
     */
    status: (s: Response["meta"]["status"]) => Response;

    /**
     * Sets the `reason` of `this.meta`.
     * 
     * @param r 
     * @returns the instance itself
     */
    reason: (r: Response["meta"]["reason"]) => Response;
}

export interface Message {
    /**
     * Metadata of the message
     */
    meta: {
        destination: string
    }

    /**
     * The data carried by the message
     */
    data: { 
        [k: string]: any 
    }
}

export type OnErrorFx = (err: Error) => void
export type ServeFx = (msg: Message, res: Response, onError: OnErrorFx) => void