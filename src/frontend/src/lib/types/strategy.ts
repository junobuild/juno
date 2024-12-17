import type { UpgradeCodeProgressState } from '@junobuild/admin';

export enum MonitoringStrategyProgressStep {
	CreateOrStopMonitoring = 1,
	ReloadSettings = 2
}

export type MonitoringStrategyProgressState = UpgradeCodeProgressState;

export interface MonitoringStrategyProgress {
	step: MonitoringStrategyProgressStep;
	state: MonitoringStrategyProgressState;
}
