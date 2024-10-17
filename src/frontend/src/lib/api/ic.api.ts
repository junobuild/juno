import type {
	canister_log_record,
	canister_settings,
	log_visibility
} from '$declarations/ic/ic.did';
import type { CanisterInfo, CanisterLogVisibility, CanisterStatus } from '$lib/types/canister';
import { getICActor } from '$lib/utils/actor.ic.utils';
import { getAgent } from '$lib/utils/agent.utils';
import {
	CanisterStatus as AgentCanisterStatus,
	AnonymousIdentity,
	type Identity
} from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { nonNullish } from '@dfinity/utils';

const toStatus = (
	status: { stopped: null } | { stopping: null } | { running: null }
): CanisterStatus =>
	'stopped' in status && status.stopped === null
		? 'stopped'
		: 'stopping' in status && status.stopping === null
			? 'stopping'
			: 'running';

const toLogVisibility = (log_visibility: log_visibility): CanisterLogVisibility =>
	'controllers' in log_visibility ? 'controllers' : 'public';

export const canisterStatus = async ({
	canisterId,
	identity
}: {
	canisterId: string;
	identity: Identity;
}): Promise<CanisterInfo> => {
	const { canister_status } = await getICActor({ identity });

	const {
		cycles,
		status,
		memory_size,
		idle_cycles_burned_per_day,
		query_stats: {
			num_instructions_total: numInstructionsTotal,
			num_calls_total: numCallsTotal,
			request_payload_bytes_total: requestPayloadBytesTotal,
			response_payload_bytes_total: responsePayloadBytesTotal
		},
		settings: {
			freezing_threshold: freezingThreshold,
			controllers,
			reserved_cycles_limit: reservedCyclesLimit,
			log_visibility,
			wasm_memory_limit: wasmMemoryLimit,
			memory_allocation: memoryAllocation,
			compute_allocation: computeAllocation
		}
	} = await canister_status({
		canister_id: Principal.fromText(canisterId)
	});

	return {
		cycles,
		status: toStatus(status),
		memorySize: memory_size,
		canisterId,
		idleCyclesBurnedPerDay: idle_cycles_burned_per_day,
		queryStats: {
			numInstructionsTotal,
			numCallsTotal,
			requestPayloadBytesTotal,
			responsePayloadBytesTotal
		},
		settings: {
			freezingThreshold,
			controllers,
			reservedCyclesLimit,
			logVisibility: toLogVisibility(log_visibility),
			wasmMemoryLimit,
			memoryAllocation,
			computeAllocation
		}
	};
};

export const canisterStart = async ({
	canisterId,
	identity
}: {
	canisterId: Principal;
	identity: Identity;
}): Promise<void> => {
	const { start_canister } = await getICActor({ identity });
	return start_canister({ canister_id: canisterId });
};

export const canisterStop = async ({
	canisterId,
	identity
}: {
	canisterId: Principal;
	identity: Identity;
}): Promise<void> => {
	const { stop_canister } = await getICActor({ identity });
	return stop_canister({ canister_id: canisterId });
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

export const canisterUpdateSettings = async ({
	canisterId,
	identity,
	settings
}: {
	canisterId: Principal;
	identity: Identity;
	settings: canister_settings;
}): Promise<void> => {
	const { update_settings } = await getICActor({ identity });
	return update_settings({ canister_id: canisterId, sender_canister_version: [], settings });
};

export const subnetId = async ({
	canisterId
}: {
	canisterId: string;
}): Promise<string | undefined> => {
	const agent = await getAgent({ identity: new AnonymousIdentity() });

	const path = 'subnet' as const;

	const result = await AgentCanisterStatus.request({
		canisterId: Principal.from(canisterId),
		agent,
		paths: [path]
	});

	const subnet: AgentCanisterStatus.Status | undefined = result.get(path);

	const isSubnetStatus = (
		subnet: AgentCanisterStatus.Status | undefined
	): subnet is AgentCanisterStatus.SubnetStatus =>
		nonNullish(subnet) && typeof subnet === 'object' && 'subnetId' in subnet;

	return isSubnetStatus(subnet) ? subnet.subnetId : undefined;
};
