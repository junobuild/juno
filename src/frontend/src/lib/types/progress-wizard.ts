import type { UpgradeCodeProgressState } from '@junobuild/admin';

export enum WizardCreateProgressStep {
	Create = 0,
	Monitoring = 1,
	Reload = 2
}

export type WizardCreateProgressState = UpgradeCodeProgressState;

export interface WizardCreateProgress {
	step: WizardCreateProgressStep;
	state: WizardCreateProgressState;
}
