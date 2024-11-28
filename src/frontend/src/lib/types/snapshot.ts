import type { snapshot } from '$declarations/ic/ic.did';
import type { UpgradeCodeProgressState } from '@junobuild/admin';

export type Snapshots = snapshot[];

export enum CreateSnapshotProgressStep {
	StoppingCanister = 1,
	CreatingSnapshot = 2,
	RestartingCanister = 3
}

export interface CreateSnapshotProgress {
	step: CreateSnapshotProgressStep;
    // TODO: rename maybe type UpgradeCodeProgressState to something generic
	state: UpgradeCodeProgressState;
}
