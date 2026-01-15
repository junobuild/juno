import type { ProgressState } from '$lib/types/progress-state';

export enum OutOfSyncProgressStep {
	Sync = 0,
	Reload = 1
}

export type OutOfSyncProgressState = ProgressState;

export interface OutOfSyncProgress {
	step: OutOfSyncProgressStep;
	state: OutOfSyncProgressState;
}
