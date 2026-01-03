import type { ProgressState } from '$lib/types/progress-state';

export enum FactoryDeleteProgressStep {
	Deposit = 0,
	StoppingCanister = 1,
	DeletingCanister = 2,
	Detaching = 3,
	Reload = 4
}

export type FactoryDeleteProgressState = ProgressState;

export interface FactoryDeleteProgress {
	step: FactoryDeleteProgressStep;
	state: FactoryDeleteProgressState;
}
