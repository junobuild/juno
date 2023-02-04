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
			'8746f9929238255b5c0ce3a7ab6b7f117464001e272d9c6c88f5c7fb5b68f5db'
		)
	});
};

await transfer();
