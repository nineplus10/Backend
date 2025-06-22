import { AccountModule } from "account/app";
import { gEnv } from "env";
import { GameClientModule } from "gameClient/app";

// Imma call it 'em module for now instead of services
// as I'm not experienced enough to confidently use this term
const accountModule = new AccountModule()
accountModule.listen(gEnv.ACC_PORT)

GameClientModule.start(gEnv.MM_PORT)
