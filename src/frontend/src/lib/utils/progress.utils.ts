import type { SnapshotProgressState } from '$lib/types/progress-snapshot';
import type { ProgressStepState } from '$lib/types/progress-step';
import type { MonitoringStrategyProgressState } from '$lib/types/progress-strategy';
import type { WizardCreateProgressState } from '$lib/types/progress-wizard';
import type { UpgradeCodeProgressState } from '@junobuild/admin';

export const mapProgressState = (
	state:
		| UpgradeCodeProgressState
		| SnapshotProgressState
		| MonitoringStrategyProgressState
		| WizardCreateProgressState
		| undefined
): ProgressStepState => {
	switch (state) {
		case 'error':
			return 'error';
		case 'success':
			return 'completed';
		case 'in_progress':
			return 'in_progress';
		case 'warning':
			return 'warning';
		default:
			return 'next';
	}
};
