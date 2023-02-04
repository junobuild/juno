import { LedgerCanister } from '@dfinity/nns';
import { localAgent } from './actor.mjs';
import { accountIdentifier, ledgerCanisterId } from './ledger.utils.mjs';

const getBalance = async () => {
	const agent = await localAgent();

	const ledger = LedgerCanister.create({
		agent,
		canisterId: ledgerCanisterId
	});

	const e8sBalance = await ledger.accountBalance({
		accountIdentifier: accountIdentifier(),
		certified: false
	});

	console.log(e8sBalance);
};

await getBalance();
