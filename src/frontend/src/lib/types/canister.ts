export type CanisterStatus = 'stopped' | 'stopping' | 'running';
export type CanisterSyncStatus = 'loading' | 'syncing' | 'synced' | 'error';

export interface CanisterInfo {
	cycles: bigint;
	memory_size: bigint;
	idle_cycles_burned_per_day?: bigint;
	status: CanisterStatus;
	canisterId: string;
}

export type CanisterData = Pick<
	CanisterInfo,
	'memory_size' | 'cycles' | 'status' | 'idle_cycles_burned_per_day'
> & {
	icp: number;
	warning: boolean;
};

export interface Canister {
	id: string;
	sync: CanisterSyncStatus;
	data?: CanisterData;
}
