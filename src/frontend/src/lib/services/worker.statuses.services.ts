import type { CanisterSegment } from '$lib/types/canister';
import type { PostMessage, PostMessageDataResponse } from '$lib/types/post-message';
import type { Principal } from '@dfinity/principal';

export type StatusesCallback = (data: PostMessageDataResponse) => void;

export interface StatusesWorker {
	startMonitoringTimer: (params: {
		segments: CanisterSegment[];
		missionControlId: Principal;
		callback: StatusesCallback;
	}) => void;
	stopMonitoringTimer: () => void;
	restartMonitoringTimer: (params: {
		segments: CanisterSegment[];
		missionControlId: Principal;
	}) => void;
}

export const initStatusesWorker = async (): Promise<StatusesWorker> => {
	const StatusesWorker = await import('$lib/workers/monitoring.worker?worker');
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
		startMonitoringTimer: ({ callback, segments, missionControlId }) => {
			statusesCallback = callback;

			statusesWorker.postMessage({
				msg: 'startMonitoringTimer',
				data: { segments, missionControlId: missionControlId.toText() }
			});
		},
		stopMonitoringTimer: () => {
			statusesWorker.postMessage({
				msg: 'stopMonitoringTimer'
			});
		},
		restartMonitoringTimer: ({ segments, missionControlId }) => {
			statusesWorker.postMessage({
				msg: 'restartMonitoringTimer',
				data: { segments, missionControlId: missionControlId.toText() }
			});
		}
	};
};
