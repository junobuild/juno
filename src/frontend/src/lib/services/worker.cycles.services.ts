import type { CanisterSegment } from '$lib/types/canister';
import type { PostMessage, PostMessageDataResponseCanister } from '$lib/types/post-message';

export type CyclesCallback = (data: PostMessageDataResponseCanister) => void;

export interface CyclesWorker {
	startCyclesTimer: (params: { segments: CanisterSegment[]; callback: CyclesCallback }) => void;
	stopCyclesTimer: () => void;
	restartCyclesTimer: (segments: CanisterSegment[]) => void;
}

export const initCyclesWorker = async (): Promise<CyclesWorker> => {
	const CyclesWorker = await import('$lib/workers/workers?worker');
	const cyclesWorker: Worker = new CyclesWorker.default();

	let cyclesCallback: CyclesCallback | undefined;

	cyclesWorker.onmessage = ({
		data
	}: MessageEvent<PostMessage<PostMessageDataResponseCanister>>) => {
		const { msg } = data;

		switch (msg) {
			case 'syncCanister':
				cyclesCallback?.(data.data as PostMessageDataResponseCanister);
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
		restartCyclesTimer: (segments) => {
			cyclesWorker.postMessage({
				msg: 'restartCyclesTimer',
				data: { segments }
			});
		}
	};
};
