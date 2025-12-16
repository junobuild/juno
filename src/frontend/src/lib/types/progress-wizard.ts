import type { UpgradeCodeProgressState } from '@junobuild/admin';

export enum WizardCreateProgressStep {
	Approve = 0,
	Create = 1,
	Monitoring = 2,
	Attaching = 3,
	Finalizing = 4,
	Reload = 5
}

export type WizardCreateProgressState = UpgradeCodeProgressState | 'warning';

export interface WizardCreateProgress {
	step: WizardCreateProgressStep;
	state: WizardCreateProgressState;
}
