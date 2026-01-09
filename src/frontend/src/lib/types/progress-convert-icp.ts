import type { ProgressState } from '$lib/types/progress-state';

export enum ConvertIcpProgressStep {
	Transfer = 0,
	Mint = 1,
	Reload = 2
}

export type ConvertIcpProgressState = ProgressState;

export interface ConvertIcpProgress {
	step: ConvertIcpProgressStep;
	state: ConvertIcpProgressState;
}
