import type { UpgradeCodeProgressState } from '@junobuild/admin';

export enum WizardCreateProgressStep {
	Approve = 0,
	Create = 1,
	Monitoring = 2,
	Finalizing = 3,
	Reload = 4
}

export type WizardCreateProgressState = UpgradeCodeProgressState;

export interface WizardCreateProgress {
	step: WizardCreateProgressStep;
	state: WizardCreateProgressState;
}
