import type { ProgressState } from '$lib/types/progress-state';

export enum WizardCreateProgressStep {
	Approve = 0,
	Create = 1,
	Monitoring = 2,
	Attaching = 3,
	Finalizing = 4,
	Reload = 5
}

export type WizardCreateProgressState = ProgressState;

export interface WizardCreateProgress {
	step: WizardCreateProgressStep;
	state: WizardCreateProgressState;
}
