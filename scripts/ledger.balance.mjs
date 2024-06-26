import { IcrcLedgerCanister } from '@dfinity/ledger-icrc';
import { icAgent, localAgent } from './actor.mjs';
import { CONSOLE_ID, LEDGER_ID } from './constants.mjs';
import { initIdentity } from './identity.utils.mjs';
import { accountIdentifier } from './ledger.utils.mjs';

const getBalance = async (mainnet, console_) => {
	const agent = await (mainnet ? icAgent : localAgent)();

	const { balance } = IcrcLedgerCanister.create({
		agent,
		canisterId: LEDGER_ID
	});

	const owner = console_ ? CONSOLE_ID : initIdentity(mainnet).getPrincipal();

	const e8sBalance = await balance({
		owner,
		certified: false
	});

	const E8S_PER_ICP = 100_000_000n;
	const formatE8sICP = (balance) => `${balance / E8S_PER_ICP} ICP`;

	console.log(formatE8sICP(e8sBalance), '|', e8sBalance);

	const identifier = accountIdentifier(mainnet, owner);

	console.log(identifier.toHex());
};

const mainnet = process.argv.find((arg) => arg.indexOf(`--mainnet`) > -1) !== undefined;
const console_ = process.argv.find((arg) => arg.indexOf(`--console`) > -1) !== undefined;

await getBalance(mainnet, console_);
