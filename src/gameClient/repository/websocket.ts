import { randomUUID } from "crypto"

export interface WebsocketCache {
    find(
        ...playerId: number[]
    ): Promise<(ReturnType<typeof randomUUID> | undefined)[]>
    save(playerId: number, connectionId: string): Promise<void>
    remove(playerId: number): Promise<void>
}