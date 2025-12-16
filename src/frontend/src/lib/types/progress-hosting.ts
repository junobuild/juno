import type { ProgressState } from '$lib/types/progress-state';

export enum HostingProgressStep {
	Setup = 0,
	Validate = 1,
	Register = 2,
	AuthConfig = 3
}

export type HostingProgressState = ProgressState;

export interface HostingProgress {
	step: HostingProgressStep;
	state: HostingProgressState;
}
