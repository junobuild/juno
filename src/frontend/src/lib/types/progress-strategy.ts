import type { UpgradeCodeProgressState } from '@junobuild/admin';

export enum MonitoringStrategyProgressStep {
	Options = 0,
	CreateOrStopMonitoring = 1,
	Reload = 2
}

export type MonitoringStrategyProgressState = UpgradeCodeProgressState;

export interface MonitoringStrategyProgress {
	step: MonitoringStrategyProgressStep;
	state: MonitoringStrategyProgressState;
}
