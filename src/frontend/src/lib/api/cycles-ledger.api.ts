import { getAgent } from '$lib/api/_agent/_agent.api';
import type { OptionIdentity } from '$lib/types/itentity';
import { assertNonNullish, nowInBigIntNanoSeconds } from '@dfinity/utils';
import { type WithdrawParams, type WithdrawResult , CyclesLedgerCanister } from '@icp-sdk/canisters/ledger/cycles';
import type { Principal } from '@icp-sdk/core/principal';

export const withdrawCycles = async ({
	canisterId,
	amount,
	identity
}: {
	canisterId: Principal;
	identity: OptionIdentity;
} & Pick<WithdrawParams, 'amount'>): Promise<WithdrawResult> => {
	const { withdraw } = await getCyclesLedgerActor({ identity });

	return await withdraw({
		to: canisterId,
		createdAtTime: nowInBigIntNanoSeconds(),
		amount
	});
};

const getCyclesLedgerActor = async ({
	identity
}: {
	identity: OptionIdentity;
}): Promise<CyclesLedgerCanister> => {
	assertNonNullish(identity, 'No internet identity to initialize the Cycles Ledger actor.');

	const agent = await getAgent({ identity });

	return CyclesLedgerCanister.create({
		agent
	});
};
