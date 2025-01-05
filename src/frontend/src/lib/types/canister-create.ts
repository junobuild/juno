import type { UpgradeCodeProgressState } from '@junobuild/admin';

export enum CanisterCreateProgressStep {
	Create = 0,
	Monitoring = 1,
	Reload = 2
}

export type CanisterCreateProgressState = UpgradeCodeProgressState;

export interface CanisterCreateProgress {
	step: CanisterCreateProgressStep;
	state: CanisterCreateProgressState;
}
