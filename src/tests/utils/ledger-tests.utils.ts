import { idlFactory as idlFactoryLedgerIcrc } from '$declarations/ledger/icrc/ledger.factory.did';
import type { PocketIc } from '@dfinity/pic';
import { nowInBigIntNanoSeconds } from '@dfinity/utils';
import type { IcpLedgerCanisterOptions } from '@icp-sdk/canisters/ledger/icp';
import { AnonymousIdentity, type Identity } from '@icp-sdk/core/agent';
import type { Principal } from '@icp-sdk/core/principal';
import { ICP_LEDGER_ID } from '../constants/ledger-tests.contants';

type LedgerActor = IcpLedgerCanisterOptions['serviceOverride'];

export const transferToken = async ({
	pic,
	owner,
	amount = 5_500_010_000n,
	ledgerId = ICP_LEDGER_ID
}: {
	pic: PocketIc;
	owner: Principal;
	amount?: bigint;
	ledgerId?: Principal;
}) => {
	const ledgerActor = pic.createActor<LedgerActor>(idlFactoryLedgerIcrc, ledgerId);

	// Pocket IC sets 1B ICP as the initial balance for the anonymous principal
	ledgerActor.setIdentity(new AnonymousIdentity());

	const { icrc1_transfer } = ledgerActor;

	await icrc1_transfer({
		amount,
		to: { owner, subaccount: [] },
		fee: [],
		memo: [],
		from_subaccount: [],
		created_at_time: []
	});
};

const TWENTY_SECONDS = 20n * 1000n * 1000n * 1000n;

export const approveToken = async ({
	pic,
	owner,
	amount,
	spender,
	ledgerId = ICP_LEDGER_ID
}: {
	pic: PocketIc;
	owner: Identity;
	amount: bigint;
	spender: Principal;
	ledgerId?: Principal;
}) => {
	const ledgerActor = pic.createActor<LedgerActor>(idlFactoryLedgerIcrc, ledgerId);

	ledgerActor.setIdentity(owner);

	const { icrc2_approve } = ledgerActor;

	await icrc2_approve({
		amount,
		spender: { owner: spender, subaccount: [] },
		created_at_time: [],
		expected_allowance: [],
		expires_at: [nowInBigIntNanoSeconds() + TWENTY_SECONDS],
		fee: [],
		from_subaccount: [],
		memo: []
	});
};
