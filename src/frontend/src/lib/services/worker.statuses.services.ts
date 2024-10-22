import type { CanisterSegment } from '$lib/types/canister';
import type { PostMessage, PostMessageDataResponse } from '$lib/types/post-message';
import type { Principal } from '@dfinity/principal';

export type StatusesCallback = (data: PostMessageDataResponse) => void;

export interface StatusesWorker {
	startStatusesTimer: (params: {
		segments: CanisterSegment[];
		missionControlId: Principal;
		callback: StatusesCallback;
	}) => void;
	stopStatusesTimer: () => void;
	restartStatusesTimer: (params: {
		segments: CanisterSegment[];
		missionControlId: Principal;
	}) => void;
}

export const initStatusesWorker = async (): Promise<StatusesWorker> => {
	const StatusesWorker = await import('$lib/workers/statuses.worker?worker');
	const statusesWorker: Worker = new StatusesWorker.default();

	let statusesCallback: StatusesCallback | undefined;

	statusesWorker.onmessage = ({ data }: MessageEvent<PostMessage<PostMessageDataResponse>>) => {
		const { msg } = data;

		switch (msg) {
			case 'syncCanister':
				statusesCallback?.(data.data);
				return;
		}
	};

	return {
		startStatusesTimer: ({ callback, segments, missionControlId }) => {
			statusesCallback = callback;

			statusesWorker.postMessage({
				msg: 'startStatusesTimer',
				data: { segments, missionControlId: missionControlId.toText() }
			});
		},
		stopStatusesTimer: () => {
			statusesWorker.postMessage({
				msg: 'stopStatusesTimer'
			});
		},
		restartStatusesTimer: (data) => {
			statusesWorker.postMessage({
				msg: 'restartStatusesTimer',
				data
			});
		}
	};
};
