import { ICPToken, LedgerCanister, TokenAmount } from '@dfinity/nns';
import { Principal } from '@dfinity/principal';
import { icAgent, localAgent } from './actor.mjs';
import {
	CONSOLE_CANISTER_ID_LOCAL,
	CONSOLE_CANISTER_ID_MAINNET,
	LEDGER_CANISTER_ID_LOCAL,
	LEDGER_CANISTER_ID_MAINNET
} from './env.mjs';
import { accountIdentifier } from './ledger.utils.mjs';

const getBalance = async (mainnet, console_) => {
	const agent = await (mainnet ? icAgent : localAgent)();

	const ledger = LedgerCanister.create({
		agent,
		canisterId: mainnet ? LEDGER_CANISTER_ID_MAINNET : LEDGER_CANISTER_ID_LOCAL
	});

	const identifier = accountIdentifier(
		mainnet,
		console_
			? Principal.fromText(mainnet ? CONSOLE_CANISTER_ID_MAINNET : CONSOLE_CANISTER_ID_LOCAL)
			: undefined
	);

	const e8sBalance = await ledger.accountBalance({
		accountIdentifier: identifier,
		certified: false
	});

	const E8S_PER_ICP = 100_000_000n;
	const formatE8sICP = (balance) => `${balance / E8S_PER_ICP} ICP`;

	const token = TokenAmount.fromE8s({ amount: e8sBalance, token: ICPToken });

	console.log(formatE8sICP(token.toE8s()), '|', e8sBalance);
	console.log(identifier.toHex());
};

const mainnet = process.argv.find((arg) => arg.indexOf(`--mainnet`) > -1) !== undefined;
const console_ = process.argv.find((arg) => arg.indexOf(`--console`) > -1) !== undefined;

await getBalance(mainnet, console_);
