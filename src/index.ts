import { AccountModule } from "account/app";
import { gEnv } from "env";
import { GameClientModule } from "game/app";

AccountModule.start(gEnv.ACC_PORT)
GameClientModule.start(gEnv.MM_PORT)
