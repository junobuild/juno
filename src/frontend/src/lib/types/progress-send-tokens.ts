import type { UpgradeCodeProgressState } from '@junobuild/admin';

export enum SendTokensProgressStep {
	Send = 0,
	Reload = 1
}

export type SendTokensProgressState = UpgradeCodeProgressState;

export interface SendTokensProgress {
	step: SendTokensProgressStep;
	state: SendTokensProgressState;
}
