import { AccountIdentifier, LedgerCanister } from '@dfinity/nns';
import { localAgent } from './actor.mjs';
import { ledgerCanisterId } from './ledger.utils.mjs';

const transfer = async () => {
	const agent = await localAgent();

	const ledger = LedgerCanister.create({
		agent,
		canisterId: ledgerCanisterId
	});

	return ledger.transfer({
		amount: 5_500_010_000n,
		to: AccountIdentifier.fromHex(
			'f3a58ea11bc128ab8a455dd7bce0a29b0a20f400625d1a46871fbfe82efed38d'
		)
	});
};

await transfer();
