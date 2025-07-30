
import { randomUUID } from "crypto";
import { AppErr, AppError } from "_lib/error/application";
import { Game } from "./game";
import { Match } from "game/domain/values/match";

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
            match: Match,
            timer: NodeJS.Timeout,
            board: Game,
            currentActor: number,
            playerProps: {
                p1: {
                    status: ConnectionStatus,
                    connection: string,
                },
                p2: {
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

    init(match: Match): RoomId {
        const roomId = randomUUID()
        this._rooms[roomId] = {
            match: match,
            timer: setTimeout(
                () => {
                    this.broadcast(this._rooms[roomId], {msg: "Match aborted"})
                    delete this._rooms[roomId]
                },
                INIT_TIMEOUT*1000
            ),
            board: new Game(),
            currentActor: Date.now() % 2,
            playerProps: {
                p1: {
                    status: "ONHOLD",
                    connection: "",
                }, 
                p2: {
                    status: "ONHOLD",
                    connection: "",
                }
            },
            others: new Set<string>()
        }

        return roomId
    }

    private broadcastBoard(room: typeof this._rooms[RoomId]) {
        const {p1, p2} = room.playerProps
        const viewP1 = room.board.view("1")
        const viewP2 = room.board.view("2")

        this.send(p1.connection, viewP1)
        this.send(p2.connection, viewP2)
        if(room.others.size > 0) {
            const viewPublic = room.board.view("0")
            room.others.forEach(o => this.send(o, viewPublic))
        }
    }

    private broadcast(room: typeof this._rooms[RoomId], payload: object) {
        const {p1, p2} = room.playerProps
        this.send(p1.connection, payload)
        this.send(p2.connection, payload)
        room.others.forEach(o => {
            this.send(o, payload)
        })
    }

    checkOut(player: number, roomId: RoomId) {
        const room = this._rooms[roomId]
        if(!room)
            return

        const {player1, player2} = room.match
        if(player != player1.id && player != player2.id) {
            // "Somebody had ..." kinda message
            return
        }
        
        const msg = `${player === player1.id? "Player 1" : "Player 2"} had disconnected`
        this.broadcast(room, { msg: msg })
    }

    spectate() {

    }

    async checkIn(player: number, roomId: RoomId) {
        const room = this._rooms[roomId]
        if(!room)
            throw new AppError(AppErr.NotFound, "Room not found")

        const {player1, player2} = room.match
        if(player != player1.id && player != player2.id) {
            throw new AppError(AppErr.Forbidden, "You're not the participant of this game")
        }

        const connection = await this.lookUpConnection(player)
        if(!connection)
            throw new AppError(AppErr.Internal, `Connection for player not found`)

        const msg = `${player === player1.id? "Player 1" : "Player 2"} had connected`
        this.broadcast(room, {msg: msg})

        const {p1, p2} = room.playerProps
        const incomingPlayer = player == player1.id
                ? room.playerProps.p1
                : room.playerProps.p2
        incomingPlayer.connection = connection
        if(p1.status == "READY" && p2.status == "READY") {
            this.send(connection, room.board.view((player === player1.id)? "1": "2"))
            return
        }
        incomingPlayer.status = "READY"

        if(p1.status == "READY" && p2.status == "READY") {
            room.timer.close()
            room.timer = setTimeout(() => {
                console.log(TimeoutMsg.RoomBegin)
            }, INIT_TRANSITION_TIMEOUT)

            this.broadcastBoard(room)
            room.timer
        }
    }

    isPlayerInMatch(roomId: RoomId, player: number): boolean {
        const room = this._rooms[roomId]
        if(!room)
            return false

        const {player1, player2} = room.match
        return player === player1.id || player === player2.id
    }
}