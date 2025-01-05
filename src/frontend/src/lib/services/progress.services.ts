import type { UpgradeCodeProgressState } from '@junobuild/admin';

export type ProgressState = UpgradeCodeProgressState;

export interface Progress<Step> {
	step: Step;
	state: ProgressState;
}

export const execute = async <Step, Result>({
	fn,
	step,
	onProgress
}: {
	fn: () => Promise<Result>;
	step: Step;
	onProgress: (progress: Progress<Step> | undefined) => void;
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
			state: 'error'
		});

		throw err;
	}
};
