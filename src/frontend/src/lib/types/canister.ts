import type { MemorySize } from '$declarations/satellite/satellite.did';
import type { ChartsData } from '$lib/types/chart';

export type CanisterStatus = 'stopped' | 'stopping' | 'running';
export type CanisterSyncStatus = 'loading' | 'syncing' | 'synced' | 'error';

export interface CanisterQueryStats {
	numInstructionsTotal: bigint;
	numCallsTotal: bigint;
	requestPayloadBytesTotal: bigint;
	responsePayloadBytesTotal: bigint;
}

export type Segment = 'satellite' | 'mission_control' | 'orbiter';

export interface CanisterSegment {
	canisterId: string;
	segment: Segment;
}

export interface CanisterInfo {
	cycles: bigint;
    memorySize: bigint;
	status: CanisterStatus;
    canisterId: string;
    idleCyclesBurnedPerDay?: bigint;
	queryStats?: CanisterQueryStats;
}

export interface CanisterWarning {
	cycles: boolean;
	heap: boolean;
}

export interface CanisterData {
	icp: number;
	warning: CanisterWarning;
	canister: Pick<CanisterInfo, 'memorySize' | 'cycles' | 'status' | 'idleCyclesBurnedPerDay' | 'queryStats'>;
	memory?: MemorySize;
}

export interface CanisterStatusData {
	chartsData: ChartsData[];
}

export interface Canister<T> {
	id: string;
	sync: CanisterSyncStatus;
	data?: T;
}

export type CanisterIcStatus = Canister<CanisterData>;

export type CanisterJunoStatus = Canister<CanisterStatusData>;
