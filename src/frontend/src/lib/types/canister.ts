export type CanisterStatus = 'stopped' | 'stopping' | 'running';
export type CanisterSyncStatus = 'syncing' | 'synced' | 'error';

export interface CanisterInfo {
	cycles: bigint;
	memory_size: bigint;
	status: CanisterStatus;
	canisterId: string;
}

export type CanisterData = Pick<CanisterInfo, 'memory_size' | 'cycles' | 'status'> & {
	icp: number;
	warning: boolean;
};

export interface Canister {
	id: string;
	sync: CanisterSyncStatus;
	data?: CanisterData;
}
