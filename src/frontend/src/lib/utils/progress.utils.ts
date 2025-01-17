import type { SnapshotProgressState } from '$lib/types/progress-snapshot';
import type { ProgressStepState } from '$lib/types/progress-step';
import type { MonitoringStrategyProgressState } from '$lib/types/progress-strategy';
import type { UpgradeCodeProgressState } from '@junobuild/admin';

export const mapProgressState = (
	state:
		| UpgradeCodeProgressState
		| SnapshotProgressState
		| MonitoringStrategyProgressState
		| undefined
): ProgressStepState => {
	switch (state) {
		case 'error':
			return 'error';
		case 'success':
			return 'completed';
		case 'in_progress':
			return 'in_progress';
		default:
			return 'next';
	}
};
