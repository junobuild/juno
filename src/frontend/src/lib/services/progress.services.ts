import type { UpgradeCodeProgressState } from '@junobuild/admin';

export type ProgressState = UpgradeCodeProgressState;

export interface Progress<Step> {
	step: Step;
	state: ProgressState;
}

export const execute = async <Step>({
	fn,
	step,
	onProgress
}: {
	fn: () => Promise<void>;
	step: Step;
	onProgress: (progress: Progress<Step> | undefined) => void;
}) => {
	onProgress({
		step,
		state: 'in_progress'
	});

	try {
		await fn();

		onProgress({
			step,
			state: 'success'
		});
	} catch (err: unknown) {
		onProgress({
			step,
			state: 'error'
		});

		throw err;
	}
};
