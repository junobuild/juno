import type { ProgressState } from '$lib/types/progress-state';

export enum FactoryCreateProgressStep {
	Approve = 0,
	Create = 1,
	Monitoring = 2,
	Attaching = 3,
	Finalizing = 4,
	Reload = 5
}

export type FactoryCreateProgressState = ProgressState;

export interface FactoryCreateProgress {
	step: FactoryCreateProgressStep;
	state: FactoryCreateProgressState;
}
