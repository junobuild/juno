import type { UpgradeCodeProgressState } from '@junobuild/admin';

export enum HostingProgressStep {
	Setup = 0,
	Validate = 1,
	Register = 2,
	AuthConfig = 3
}

export type HostingProgressState = UpgradeCodeProgressState;

export interface HostingProgress {
	step: HostingProgressStep;
	state: HostingProgressState;
}
