export interface WebsocketCache {
    find(...playerId: number[]): Promise<(string | undefined)[]>
    save(playerId: number, connectionId: string): Promise<void>
    remove(playerId: number): Promise<void>
}