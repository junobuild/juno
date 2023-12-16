import type { MemorySize } from '$declarations/satellite/satellite.did';

export type CanisterStatus = 'stopped' | 'stopping' | 'running';
export type CanisterSyncStatus = 'loading' | 'syncing' | 'synced' | 'error';

export type Segment = 'satellite' | 'mission_control' | 'orbiter';

export interface CanisterSegment {
	canisterId: string;
	segment: Segment;
}

export interface CanisterInfo {
	cycles: bigint;
	memory_size: bigint;
	idle_cycles_burned_per_day?: bigint;
	status: CanisterStatus;
	canisterId: string;
}

export type CanisterData = {
	icp: number;
	warning: boolean;
	canister: Pick<CanisterInfo, 'memory_size' | 'cycles' | 'status' | 'idle_cycles_burned_per_day'>;
	memory?: MemorySize;
};

export interface Canister {
	id: string;
	sync: CanisterSyncStatus;
	data?: CanisterData;
}
