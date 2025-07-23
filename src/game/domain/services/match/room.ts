
import { randomUUID } from "crypto";
import { Board } from "./board";

type RoomId = string

/** Handles the bookkeeping and messaging of rooms. */
export class RoomManager {
    private readonly _rooms: { 
        [id: RoomId]:  {
            board: Board
            currentActor: number,
            participants: {
                player1: number,
                player2: number
            },
            others: Set<string>
        }
    }

    constructor() {
        this._rooms = {}
    }

    init(player1: number, player2: number): RoomId {
        const roomId = randomUUID() // TODO: change latee
        this._rooms[roomId] = {
            board: new Board(),
            currentActor: Date.now() % 2,
            participants: {
                player1: player1, 
                player2: player2
            },
            others: new Set<string>()
        }
        return roomId
    }

    join(roomId: RoomId, connectionId: string) {
        this._rooms[roomId].others.add(connectionId)
    }

    leave(roomId: RoomId, connectionId: string) {
        this._rooms[roomId].others.delete(connectionId)
    }

    getRoomParticipants(roomId: RoomId) {
        return this._rooms[roomId].participants
    }
}