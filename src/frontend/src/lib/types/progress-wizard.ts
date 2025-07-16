import type { UpgradeCodeProgressState } from '@junobuild/admin';

export enum WizardCreateProgressStep {
	Create = 0,
	Monitoring = 1,
	Finalizing = 2,
	Reload = 3
}

export type WizardCreateProgressState = UpgradeCodeProgressState;

export interface WizardCreateProgress {
	step: WizardCreateProgressStep;
	state: WizardCreateProgressState;
}
