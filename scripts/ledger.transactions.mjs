import { encodeIcrcAccount, IcrcIndexCanister } from '@icp-sdk/canisters/ledger/icrc';
import { icAnonymousAgent, localAgent } from './actor.mjs';
import { CONSOLE_ID, CYCLES_INDEX_ID } from './constants.mjs';
import { targetMainnet } from './utils.mjs';

const mainnet = targetMainnet();

const getCyclesTransactions = async (mainnet) => {
	const agent = await (mainnet ? icAnonymousAgent : localAgent)();

	const { getTransactions } = IcrcIndexCanister.create({
		agent,
		canisterId: CYCLES_INDEX_ID
	});

	const { transactions } = await getTransactions({
		account: { owner: CONSOLE_ID },
		certified: true,
		max_results: 100n
	});

	const ONE_TRILLION = 1_000_000_000_000n;
	const formatE12sCycles = (balance) => `${balance / ONE_TRILLION} TCycles`;

	const display = transactions.reduce((acc, { id, transaction: { transfer: didTransfer } }) => {
		const [transfer] = didTransfer;
		const { from, amount } = transfer;

		return {
			...acc,
			[`ID ${id}`]: {
				from: encodeIcrcAccount(from),
				amount: formatE12sCycles(amount)
			}
		};
	}, {});

	console.table(display);
};

await getCyclesTransactions(mainnet);
