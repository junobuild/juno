import type { UpgradeCodeProgressState } from '@junobuild/admin';

export enum HostingProgressStep {
	CustomDomain = 0,
	AuthConfig = 1
}

export type HostingProgressState = UpgradeCodeProgressState;

export interface HostingProgress {
	step: HostingProgressStep;
	state: HostingProgressState;
}
