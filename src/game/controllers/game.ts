import { AppErr, AppError } from "_lib/error/application";
import { ZodValidator } from "_lib/validation/zod";
import { Message, OnErrorFx, Response } from "_lib/websocket";
import { GameService } from "game/services/game";
import { z } from "zod";

const VALID_JOIN_MSG = z.object({
    roomName: z.string()
})

export class GameController {
    constructor(
        private readonly _gameService: GameService
    ) {

    }

    async join(msg: Message, _: Response, onError: OnErrorFx) {
        const props = {
            playerId: msg.data.player.id,
            roomName: msg.data.roomName
        }
        const validator = new ZodValidator<
            z.infer<typeof VALID_JOIN_MSG>
                >(VALID_JOIN_MSG)
        const {data, error} = validator.validate(props)
        if(error)
            onError(new AppError(
                AppErr.BadRequest,
                validator.getErrMessage(error)))
            
        try {
            await this._gameService.join(data.roomName, msg.data.player.id)
        } catch(err: any) {
            console.log(err)
            onError(err)
        }
    }
}