import { IcrcLedgerCanister } from '@dfinity/ledger-icrc';
import { Principal } from '@dfinity/principal';
import { icAgent, localAgent } from './actor.mjs';
import {
	CONSOLE_CANISTER_ID_LOCAL,
	CONSOLE_CANISTER_ID_MAINNET,
	LEDGER_CANISTER_ID_LOCAL,
	LEDGER_CANISTER_ID_MAINNET
} from './env.mjs';
import { initIdentity } from './identity.utils.mjs';
import { accountIdentifier } from './ledger.utils.mjs';

const getBalance = async (mainnet, console_) => {
	const agent = await (mainnet ? icAgent : localAgent)();

	const { balance } = IcrcLedgerCanister.create({
		agent,
		canisterId: mainnet ? LEDGER_CANISTER_ID_MAINNET : LEDGER_CANISTER_ID_LOCAL
	});

	const owner = console_
		? Principal.fromText(mainnet ? CONSOLE_CANISTER_ID_MAINNET : CONSOLE_CANISTER_ID_LOCAL)
		: initIdentity(mainnet).getPrincipal();

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
