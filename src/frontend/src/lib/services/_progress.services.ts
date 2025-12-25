import type { ProgressState } from '$lib/types/progress-state';

export interface Progress<Step> {
	step: Step;
	state: ProgressState;
}

export const execute = async <Step, Result>({
	fn,
	step,
	onProgress,
	errorState = 'error'
}: {
	fn: () => Promise<Result>;
	step: Step;
	onProgress: (progress: Progress<Step> | undefined) => void;
	errorState?: 'error' | 'warning';
}): Promise<Result> => {
	onProgress({
		step,
		state: 'in_progress'
	});

	try {
		const result = await fn();

		onProgress({
			step,
			state: 'success'
		});

		return result;
	} catch (err: unknown) {
		onProgress({
			step,
			state: errorState
		});

		throw err;
	}
};
