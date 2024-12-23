import type { MemorySize } from '$declarations/satellite/satellite.did';
import type { ChartsData } from '$lib/types/chart';
import type { PrincipalText } from '$lib/types/itentity';
import type { MonitoringHistory } from '$lib/types/monitoring';
import type { Principal } from '@dfinity/principal';

export type CanisterStatus = 'stopped' | 'stopping' | 'running';
export type CanisterSyncStatus = 'loading' | 'syncing' | 'synced' | 'error';
export type CanisterLogVisibility = 'controllers' | 'public';

export interface CanisterSettings {
	freezingThreshold: bigint;
	controllers: Principal[];
	reservedCyclesLimit: bigint;
	logVisibility: CanisterLogVisibility;
	wasmMemoryLimit: bigint;
	memoryAllocation: bigint;
	computeAllocation: bigint;
}

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

export interface CanisterSegmentWithLabel extends CanisterSegment {
	label: string;
}

export interface CanisterInfo {
	cycles: bigint;
	memorySize: bigint;
	status: CanisterStatus;
	canisterId: string;
	idleCyclesBurnedPerDay?: bigint;
	queryStats?: CanisterQueryStats;
	settings?: CanisterSettings;
}

export interface CanisterWarning {
	cycles: boolean;
	heap: boolean;
}

export interface CanisterData {
	icp: number;
	warning: CanisterWarning;
	canister: Omit<CanisterInfo, 'canisterId'>;
	memory?: MemorySize;
}

export interface CanisterMonitoringChartsData {
	chartsData: ChartsData[];
}

export type CanisterIdText = PrincipalText;

export interface Canister<T> {
	id: CanisterIdText;
	sync: CanisterSyncStatus;
	data?: T;
}

export type CanisterSyncData = Canister<CanisterData>;

export type CanisterSyncMonitoringCharts = Canister<CanisterMonitoringChartsData>;

export type CanisterSyncMonitoringHistory = Canister<MonitoringHistory>;
