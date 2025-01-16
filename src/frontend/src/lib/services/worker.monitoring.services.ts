import type { CanisterSegment } from '$lib/types/canister';
import type { PostMessage, PostMessageDataResponseCanister } from '$lib/types/post-message';
import type { Principal } from '@dfinity/principal';

export type MonitoringCallback = (data: PostMessageDataResponseCanister) => void;

export interface MonitoringWorker {
	startMonitoringTimer: (params: {
		segments: CanisterSegment[];
		missionControlId: Principal;
		withMonitoringHistory: boolean;
		callback: MonitoringCallback;
	}) => void;
	stopMonitoringTimer: () => void;
	restartMonitoringTimer: (params: {
		segments: CanisterSegment[];
		missionControlId: Principal;
	}) => void;
}

export const initStatusesWorker = async (): Promise<MonitoringWorker> => {
	const MonitoringWorker = await import('$lib/workers/workers?worker');
	const monitoringWorker: Worker = new MonitoringWorker.default();

	let monitoringCallback: MonitoringCallback | undefined;

	monitoringWorker.onmessage = ({
		data
	}: MessageEvent<PostMessage<PostMessageDataResponseCanister>>) => {
		const { msg } = data;

		switch (msg) {
			case 'syncCanister':
				monitoringCallback?.(data.data as PostMessageDataResponseCanister);
				return;
		}
	};

	return {
		startMonitoringTimer: ({ callback, segments, missionControlId, withMonitoringHistory }) => {
			monitoringCallback = callback;

			monitoringWorker.postMessage({
				msg: 'startMonitoringTimer',
				data: { segments, missionControlId: missionControlId.toText(), withMonitoringHistory }
			});
		},
		stopMonitoringTimer: () => {
			monitoringWorker.postMessage({
				msg: 'stopMonitoringTimer'
			});
		},
		restartMonitoringTimer: ({ segments, missionControlId }) => {
			monitoringWorker.postMessage({
				msg: 'restartMonitoringTimer',
				data: { segments, missionControlId: missionControlId.toText() }
			});
		}
	};
};
