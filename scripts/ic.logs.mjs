import { Principal } from '@dfinity/principal';
import { icActorIC } from './actor.mjs';

const { fetch_canister_logs } = await icActorIC();
const logs = await fetch_canister_logs({
	canister_id: Principal.fromText('nbyi7-6aaaa-aaaal-acjtq-cai')
});
console.log(logs);
