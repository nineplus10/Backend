
import { randomUUID } from "crypto";
import { AppErr, AppError } from "_lib/error/application";
import { Board } from "./game/board";

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
            board: Board,
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
            board: new Board(),
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
        const {player1: p1Conn, player2: p2Conn} = room.participants
        const {cap, round, player1, player2} = room.board
        const payload = {
            cap: cap,
            round: round,
            player1: player1,
            player2: player2
        }

        this.send(p1Conn.connection, payload)
        this.send(p2Conn.connection, payload)
        room.others.forEach(o => this.send(o, payload))

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