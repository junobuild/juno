import type { _SERVICE as ICActor, canister_log_record } from '$declarations/ic/ic.did';
import type { CanisterInfo, CanisterStatus } from '$lib/types/canister';
import { getICActor } from '$lib/utils/actor.ic.utils';
import type { Identity } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';

const toStatus = (
	status: { stopped: null } | { stopping: null } | { running: null }
): CanisterStatus =>
	'stopped' in status && status.stopped === null
		? 'stopped'
		: 'stopping' in status && status.stopping === null
			? 'stopping'
			: 'running';

export const canisterStatus = async ({
	canisterId,
	identity
}: {
	canisterId: string;
	identity: Identity;
}): Promise<CanisterInfo> => {
	const actor: ICActor = await getICActor({ identity });

	const { cycles, status, memory_size, idle_cycles_burned_per_day } = await actor.canister_status({
		canister_id: Principal.fromText(canisterId)
	});

	return { cycles, status: toStatus(status), memory_size, canisterId, idle_cycles_burned_per_day };
};

export const canisterStart = async ({
	canisterId,
	identity
}: {
	canisterId: Principal;
	identity: Identity;
}): Promise<void> => {
	const actor: ICActor = await getICActor({ identity });
	return actor.start_canister({ canister_id: canisterId });
};

export const canisterStop = async ({
	canisterId,
	identity
}: {
	canisterId: Principal;
	identity: Identity;
}): Promise<void> => {
	const actor: ICActor = await getICActor({ identity });
	return actor.stop_canister({ canister_id: canisterId });
};

export const canisterLogs = async ({
	canisterId,
	identity
}: {
	canisterId: Principal;
	identity: Identity;
}): Promise<canister_log_record[]> => {
	const { fetch_canister_logs } = await getICActor({ identity });

	const { canister_log_records } = await fetch_canister_logs({
		canister_id: canisterId
	});

	return canister_log_records;
};
