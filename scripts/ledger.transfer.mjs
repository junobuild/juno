import { IcrcLedgerCanister } from '@dfinity/ledger';
import { Principal } from '@dfinity/principal';
import { localAgent } from './actor.mjs';
import { LEDGER_CANISTER_ID_LOCAL } from './env.mjs';

const transfer = async () => {
	const agent = await localAgent();

	const ledger = IcrcLedgerCanister.create({
		agent,
		canisterId: LEDGER_CANISTER_ID_LOCAL
	});

	return ledger.transfer({
		amount: 5_500_010_000n,
		to: { owner: Principal.fromText('qaa6y-5yaaa-aaaaa-aaafa-cai'), subaccount: [] }
	});
};

await transfer();
