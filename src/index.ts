import { AccountModule } from "account/app";
import { gEnv } from "env";

// Imma call it 'em module for now instead of services
// as I'm not knowledgeable enough to use this term
const accountModule = new AccountModule()

accountModule.listen(gEnv.ACC_PORT)