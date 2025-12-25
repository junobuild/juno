import type { ProgressState } from '$lib/types/progress-state';

export enum TopUpProgressStep {
	TopUp = 0,
	Reload = 1
}

export type TopUpProgressState = ProgressState;

export interface TopUpProgress {
	step: TopUpProgressStep;
	state: TopUpProgressState;
}
