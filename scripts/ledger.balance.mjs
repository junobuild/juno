import { AccountIdentifier } from '@icp-sdk/canisters/ledger/icp';
import { IcrcLedgerCanister } from '@icp-sdk/canisters/ledger/icrc';
import { icAnonymousAgent, localAgent } from './actor.mjs';
import { CONSOLE_ID, LEDGER_ID } from './constants.mjs';
import { targetMainnet } from './utils.mjs';

const getBalance = async (mainnet) => {
	const agent = await (mainnet ? icAnonymousAgent : localAgent)();

	const { balance } = IcrcLedgerCanister.create({
		agent,
		canisterId: LEDGER_ID
	});

	const e8sBalance = await balance({
		owner: CONSOLE_ID,
		certified: false
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

await getBalance(mainnet);
