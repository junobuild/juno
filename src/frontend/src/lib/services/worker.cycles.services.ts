import type { CanisterSegment } from '$lib/types/canister';
import type { PostMessage, PostMessageDataResponse } from '$lib/types/post-message';

export type CyclesCallback = (data: PostMessageDataResponse) => void;

export interface CyclesWorker {
	startCyclesTimer: (params: { segments: CanisterSegment[]; callback: CyclesCallback }) => void;
	stopCyclesTimer: () => void;
	restartCyclesTimer: (canisterIds: string[]) => void;
}

export const initCyclesWorker = async (): Promise<CyclesWorker> => {
	const CyclesWorker = await import('$lib/workers/cycles.worker?worker');
	const cyclesWorker: Worker = new CyclesWorker.default();

	let cyclesCallback: CyclesCallback | undefined;

	cyclesWorker.onmessage = async ({ data }: MessageEvent<PostMessage<PostMessageDataResponse>>) => {
		const { msg } = data;

		switch (msg) {
			case 'syncCanister':
				cyclesCallback?.(data.data);
				return;
		}
	};

	return {
		startCyclesTimer: ({
			callback,
			segments
		}: {
			segments: CanisterSegment[];
			callback: CyclesCallback;
		}) => {
			cyclesCallback = callback;

			cyclesWorker.postMessage({
				msg: 'startCyclesTimer',
				data: { segments }
			});
		},
		stopCyclesTimer: () => {
			cyclesWorker.postMessage({
				msg: 'stopCyclesTimer'
			});
		},
		restartCyclesTimer: (canisterIds: string[]) => {
			cyclesWorker.postMessage({
				msg: 'restartCyclesTimer',
				data: { canisterIds }
			});
		}
	};
};
