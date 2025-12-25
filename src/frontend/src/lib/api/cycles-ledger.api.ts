import { idlFactoryCyclesLedger, type CyclesLedgerActor } from '$declarations';
import { ActorApi } from '$lib/api/actors/actor.api';
import type { OptionIdentity } from '$lib/types/itentity';
import { nowInBigIntNanoSeconds, toNullable } from '@dfinity/utils';
import type { Principal } from '@icp-sdk/core/principal';
import { CYCLES_LEDGER_CANISTER_ID } from '$lib/constants/app.constants';

const cyclesLedgerActor = new ActorApi<CyclesLedgerActor>();

export const withdrawCycles = async ({
	canisterId,
	identity
}: {
	canisterId: Principal;
	identity: OptionIdentity;
}): Promise<void> => {
	const { withdraw } = await getCyclesLedgerActor({ identity });
	const result = await withdraw({
		to: canisterId,
		from_subaccount: toNullable(),
		created_at_time: toNullable(nowInBigIntNanoSeconds()),
		amount: 1_000_000_000_000n // 1 T Cycles
	});

	console.log(canisterId.toText(), result);
};

const getCyclesLedgerActor = async ({
	identity
}: {
	identity: OptionIdentity;
}): Promise<CyclesLedgerActor> =>
	await cyclesLedgerActor.getActor({
		canisterId: CYCLES_LEDGER_CANISTER_ID,
		idlFactory: idlFactoryCyclesLedger,
		identity
	});
