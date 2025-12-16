import type { ICDid } from '$declarations';
import type { ProgressState } from '$lib/types/progress-state';

export type Snapshots = ICDid.snapshot[];

export enum SnapshotProgressStep {
	StoppingCanister = 1,
	CreateOrRestoreSnapshot = 2,
	RestartingCanister = 3
}

export type SnapshotProgressState = ProgressState;

export interface SnapshotProgress {
	step: SnapshotProgressStep;
	state: SnapshotProgressState;
}
