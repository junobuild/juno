import type { ProgressState } from '$lib/types/progress-state';

export enum SendTokensProgressStep {
	Send = 0,
	Reload = 1
}

export type SendTokensProgressState = ProgressState;

export interface SendTokensProgress {
	step: SendTokensProgressStep;
	state: SendTokensProgressState;
}
