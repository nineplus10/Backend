export interface GameCache {
    getPlayerGameStatus: (playerId: number) => Promise<boolean>
    saveStatus: (playerId: number, status: "INGAME" | "IDLE") => Promise<void>
}