import {
	syncCanisterMonitoring,
	syncCanistersMonitoring
} from '$lib/services/canisters.loader.services';
import type { CanisterSegment } from '$lib/types/canister';
import type { MissionControlId } from '$lib/types/mission-control';
import type {
	PostMessage,
	PostMessageDataResponseCanister,
	PostMessageDataResponseCanisterMonitoring,
	PostMessageDataResponseCanistersMonitoring
} from '$lib/types/post-message';

export interface MonitoringWorker {
	startMonitoringTimer: (params: {
		segments: CanisterSegment[];
		missionControlId: MissionControlId;
		withMonitoringHistory: boolean;
	}) => void;
	stopMonitoringTimer: () => void;
	restartMonitoringTimer: (params: {
		segments: CanisterSegment[];
		missionControlId: MissionControlId;
	}) => void;
}

export const initMonitoringWorker = async (): Promise<MonitoringWorker> => {
	const MonitoringWorker = await import('$lib/workers/workers?worker');
	const monitoringWorker: Worker = new MonitoringWorker.default();

	monitoringWorker.onmessage = ({
		data
	}: MessageEvent<PostMessage<PostMessageDataResponseCanister>>) => {
		const { msg } = data;

		switch (msg) {
			case 'syncCanister':
				syncCanisterMonitoring(data.data as PostMessageDataResponseCanisterMonitoring);
				return;
			case 'syncCanisters':
				syncCanistersMonitoring(data.data as PostMessageDataResponseCanistersMonitoring);
				return;
		}
	};

	return {
		startMonitoringTimer: ({ segments, missionControlId, withMonitoringHistory }) => {
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
