import { idlFactory as idlFactoryLedger } from '$declarations/ledger/icp/ledger.factory.did.js';
import type { PocketIc } from '@dfinity/pic';
import type { IcpLedgerCanisterOptions } from '@icp-sdk/canisters/ledger/icp';
import { AnonymousIdentity } from '@icp-sdk/core/agent';
import type { Principal } from '@icp-sdk/core/principal';
import { LEDGER_ID } from '../constants/ledger-tests.contants';

type LedgerActor = IcpLedgerCanisterOptions['serviceOverride'];

export const transferIcp = async ({ pic, owner }: { pic: PocketIc; owner: Principal }) => {
	const ledgerActor = pic.createActor<LedgerActor>(idlFactoryLedger, LEDGER_ID);

	// Pocket IC sets 1B ICP as the initial balance for the anonymous principal
	ledgerActor.setIdentity(new AnonymousIdentity());

	const { icrc1_transfer } = ledgerActor;

	await icrc1_transfer({
		amount: 5_500_010_000n,
		to: { owner, subaccount: [] },
		fee: [],
		memo: [],
		from_subaccount: [],
		created_at_time: []
	});
};
