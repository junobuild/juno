import type { ProgressState } from '$lib/types/progress-state';

export enum MonitoringStrategyProgressStep {
	Options = 0,
	CreateOrStopMonitoring = 1,
	Reload = 2
}

export type MonitoringStrategyProgressState = ProgressState;

export interface MonitoringStrategyProgress {
	step: MonitoringStrategyProgressStep;
	state: MonitoringStrategyProgressState;
}
