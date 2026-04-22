import { AccountIdentifier } from '@icp-sdk/canisters/ledger/icp';
import { IcrcLedgerCanister } from '@icp-sdk/canisters/ledger/icrc';
import { icAnonymousAgent, localAgent } from './actor.mjs';
import { CONSOLE_ID, CYCLES_LEDGER_ID, ICP_LEDGER_ID } from './constants.mjs';
import { targetMainnet } from './utils.mjs';

const getIcpBalance = async (mainnet) => {
	const agent = await (mainnet ? icAnonymousAgent : localAgent)();

	const { balance } = IcrcLedgerCanister.create({
		agent,
		canisterId: ICP_LEDGER_ID
	});

	const e8sBalance = await balance({
		owner: CONSOLE_ID,
		certified: true
	});

	const E8S_PER_ICP = 100_000_000n;
	const formatE8sICP = (balance) => `${balance / E8S_PER_ICP} ICP`;

	console.log(formatE8sICP(e8sBalance), '|', e8sBalance);

	const identifier = AccountIdentifier.fromPrincipal({
		principal: CONSOLE_ID,
		subAccount: undefined
	});

	console.log(identifier.toHex());
};

const mainnet = targetMainnet();

const getCyclesBalance = async (mainnet) => {
	const agent = await (mainnet ? icAnonymousAgent : localAgent)();

	const { balance } = IcrcLedgerCanister.create({
		agent,
		canisterId: CYCLES_LEDGER_ID
	});

	const e12sBalance = await balance({
		owner: CONSOLE_ID,
		certified: true
	});

	const ONE_TRILLION = 1_000_000_000_000n;
	const formatE12sCycles = (balance) => `${balance / ONE_TRILLION} TCycles`;

	console.log(formatE12sCycles(e12sBalance), '|', e12sBalance);

	console.log(CONSOLE_ID.toText());
};

await getIcpBalance(mainnet);
console.log();
await getCyclesBalance(mainnet);
