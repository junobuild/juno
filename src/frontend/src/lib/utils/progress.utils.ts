import type { ProgressStepState } from '$lib/types/progress-step';
import type { UpgradeCodeProgressState } from '@junobuild/admin';

export const mapProgressState = (
	state: UpgradeCodeProgressState | undefined
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
