import type { UpgradeCodeProgressState } from '@junobuild/admin';

export enum HostingProgressStep {
	Validate = 0,
	Register = 1,
	AuthConfig = 2
}

export type HostingProgressState = UpgradeCodeProgressState;

export interface HostingProgress {
	step: HostingProgressStep;
	state: HostingProgressState;
}
