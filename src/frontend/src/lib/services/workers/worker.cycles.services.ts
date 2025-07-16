import {
	syncCanistersSyncData,
	syncCanisterSyncData
} from '$lib/services/canisters.loader.services';
import type { CanisterSegment } from '$lib/types/canister';
import type {
	PostMessageDataResponseCanistersSyncData,
	PostMessageDataResponseCanisterSyncData,
	PostMessages
} from '$lib/types/post-message';

export interface CyclesWorker {
	startCyclesTimer: (params: { segments: CanisterSegment[] }) => void;
	stopCyclesTimer: () => void;
	restartCyclesTimer: (segments: CanisterSegment[]) => void;
	destroy: () => void;
}

export const initCyclesWorker = async (): Promise<CyclesWorker> => {
	const CyclesWorker = await import('$lib/workers/workers?worker');
	let cyclesWorker: Worker | null = new CyclesWorker.default();

	cyclesWorker.onmessage = ({ data }: MessageEvent<PostMessages>) => {
		const { msg } = data;

		switch (msg) {
			case 'syncCanister':
				syncCanisterSyncData(data.data as PostMessageDataResponseCanisterSyncData);
				return;
			case 'syncCanisters':
				syncCanistersSyncData(data.data as PostMessageDataResponseCanistersSyncData);
				return;
		}
	};

	return {
		startCyclesTimer: ({ segments }: { segments: CanisterSegment[] }) => {
			cyclesWorker?.postMessage({
				msg: 'startCyclesTimer',
				data: { segments }
			});
		},
		stopCyclesTimer: () => {
			cyclesWorker?.postMessage({
				msg: 'stopCyclesTimer'
			});
		},
		restartCyclesTimer: (segments) => {
			cyclesWorker?.postMessage({
				msg: 'restartCyclesTimer',
				data: { segments }
			});
		},
		destroy: () => {
			cyclesWorker.terminate();
		}
	};
};
