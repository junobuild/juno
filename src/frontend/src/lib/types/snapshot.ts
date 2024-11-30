import type { snapshot } from '$declarations/ic/ic.did';
import type { UpgradeCodeProgressState } from '@junobuild/admin';

export type Snapshots = snapshot[];

export enum SnapshotProgressStep {
	StoppingCanister = 1,
	CreateOrRestoreSnapshot = 2,
	RestartingCanister = 3
}

export type SnapshotProgressState = UpgradeCodeProgressState;

export interface SnapshotProgress {
	step: SnapshotProgressStep;
	state: SnapshotProgressState;
}
