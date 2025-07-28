
import { randomUUID } from "crypto";
import { AppErr, AppError } from "_lib/error/application";
import { Game } from "./game";

type RoomId = string
type ConnectionStatus = "READY" | "ONHOLD"

const INIT_TIMEOUT = 300
const INIT_TRANSITION_TIMEOUT = 5

enum TimeoutMsg {
    RoomAborted = "WAITING FOR PLAYERS",
    RoomBegin = "GAME STARTED"
}

/** Handles the bookkeeping and messaging of rooms. */
export class MatchManager {
    private readonly _rooms: { 
        [id: RoomId]:  {
            timer: NodeJS.Timeout,
            board: Game,
            currentActor: number,
            participants: {
                player1: {
                    id: number,
                    status: ConnectionStatus,
                    connection: string,
                },
                player2: {
                    id: number,
                    status: ConnectionStatus,
                    connection: string,
                }
            },
            others: Set<string>
        }
    }

    constructor(
        private readonly lookUpConnection: (identifier: number) => Promise<string | undefined>,
        private readonly send: (connName: string, payload: object) => void
    ) {
        this._rooms = {}
    }

    init(player1: number, player2: number): RoomId {
        const roomId = randomUUID()
        this._rooms[roomId] = {
            timer: setTimeout(
                () => {
                    this.broadcast(this._rooms[roomId], {msg: "Match aborted"})
                    delete this._rooms[roomId]
                },
                INIT_TIMEOUT*1000
            ),
            board: new Game(),
            currentActor: Date.now() % 2,
            participants: {
                player1: {
                    id: player1,
                    status: "ONHOLD",
                    connection: "",
                }, 
                player2: {
                    id: player2,
                    status: "ONHOLD",
                    connection: "",
                }
            },
            others: new Set<string>()
        }

        return roomId
    }

    // TODO: Send information based on the receiver. Players shouldn't get the 
    // complete details of what the opposing player have while the spectators get
    // the complete picture of the board. Perhaps delegate the functionalities
    // to `Board` class instead
    private broadcastBoard(room: typeof this._rooms[RoomId]) {
        const {player1, player2} = room.participants
        const viewP1 = room.board.view("1")
        const viewP2 = room.board.view("2")

        this.send(player1.connection, viewP1)
        this.send(player2.connection, viewP2)
        if(room.others.size > 0) {
            const viewPublic = room.board.view("0")
            room.others.forEach(o => this.send(o, viewPublic))
        }
    }

    private broadcast(room: typeof this._rooms[RoomId], payload: object) {
        const {player1, player2} = room.participants
        this.send(player1.connection, payload)
        this.send(player2.connection, payload)
        room.others.forEach(o => {
            this.send(o, payload)
        })
    }

    async checkIn(roomId: RoomId, player: number) {
        const room = this._rooms[roomId]
        if(!room)
            throw new AppError( AppErr.NotFound, "Room not found")

        const {player1, player2} = room.participants
        if(player != player1.id && player != player2.id) {
            throw new AppError( AppErr.Forbidden, "You're not the participant of this game")
        }

        const connection = await this.lookUpConnection(player)
        if(!connection)
            throw new AppError(
                AppErr.Internal, `Connection for player not found`)

        const incomingPlayer = player == player1.id? player1: player2
        incomingPlayer.status = "READY"
        incomingPlayer.connection = connection

        if(player1.status == "READY" && player2.status == "READY") {
            room.timer.close()
            room.timer = setTimeout(() => {
                console.log(TimeoutMsg.RoomBegin)
            }, INIT_TRANSITION_TIMEOUT)

            this.broadcastBoard(room)
            room.timer
        }
    }

    switch(roomId: RoomId) {
        const room = this._rooms[roomId]
        if(!room)
            throw new AppError( AppErr.NotFound, "Room not found")
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