
import { randomUUID } from "crypto";
import { Match } from "../../values/match.ts";
import { Game } from "./game.ts";
import { AppErr, AppError } from "@nineplus10/lib/src/error/application.ts";
import { PlayerReference } from "./player.ts";
import { Action } from "./action.ts";

enum TimeoutMsg {
    RoomAborted = "WAITING FOR PLAYERS",
    RoomBegin = "GAME STARTED"
}

type RoomId = string

const INIT_TIMEOUT = 300
const INIT_TRANSITION_TIMEOUT = 5

/** Handles the bookkeeping and messaging of rooms. */
export class MatchManager {
    private readonly _rooms: { 
        [id: RoomId]:  {
            match: Match,
            timer: NodeJS.Timeout,
            game: Game,
            playerProps: {
                p1: {
                    connection: string,
                },
                p2: {
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
        const game = new Game()
        this._rooms[roomId] = {
            match: match,
            timer: setTimeout(
                () => {
                    this.broadcast(this._rooms[roomId], {msg: "Match aborted"})
                    delete this._rooms[roomId]
                },
                INIT_TIMEOUT*1000
            ),
            game: game,
            playerProps: {
                p1: {
                    connection: ""
                }, 
                p2: {
                    connection: ""
                }
            },
            others: new Set<string>()
        }

        game.subscribeOnAction((action: Action) => {
            this.broadcastGameInfo(this._rooms[roomId])
        })
        return roomId
    }

    private broadcastGameInfo(room: typeof this._rooms[RoomId]) {
        const {p1, p2} = room.playerProps
        const viewP1 = room.game.view("1")
        const viewP2 = room.game.view("2")

        this.send(p1.connection, viewP1)
        this.send(p2.connection, viewP2)
        if(room.others.size > 0) {
            const viewPublic = room.game.view("0")
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
        const incomingPlayer = 
            player == player1.id
                ? room.playerProps.p1
                : room.playerProps.p2
        if(p1.connection !== "" && p2.connection !== "") { // Reconnection
            this.send(connection, room.game.view((player === player1.id)? "1": "2"))
            return
        }

        // Initial connection
        incomingPlayer.connection = connection 
        if(p1.connection !== "" && p2.connection !== "") {
            room.timer.close()
            room.timer = setTimeout(() => {
                console.log(TimeoutMsg.RoomBegin)
            }, INIT_TRANSITION_TIMEOUT)

            this.broadcastGameInfo(room)
            this.send(
                room.game.currentPlayer === "1"? p1.connection: p2.connection,
                {msg: "Your turn"})
            room.timer
        }
    }

    getPlayerReference(roomId: RoomId, player: number): PlayerReference | undefined {
        const room = this._rooms[roomId]
        if(!room)
            return undefined

        const {player1, player2} = room.match
        switch(player) {
            case player1.id: return "1"
            case player2.id: return "2"
            default: return undefined
        }
    }

    doAction(roomId: RoomId, action: Action): boolean {
        const room = this._rooms[roomId]
        if(!room)
            return false

        room.game.act(action)
        return true
    }
}