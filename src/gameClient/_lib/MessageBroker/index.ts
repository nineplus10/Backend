export type ConsumeFx = (value: any) => void

export type ConsumerEntry<ConnectionType> =  {
    conn: ConnectionType,
    usecase: string,
    subscribers: ConsumeFx[]
}

export interface MessageBrokerHandler {
    subscribeTo(topic: string, usecase: string, onMsg: ConsumeFx): Promise<void>
    produceTo(topic: string, payload: any[]): Promise<void>
}
