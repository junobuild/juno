import {
	syncCanisterMonitoring,
	syncCanistersMonitoring
} from '$lib/services/canisters.loader.services';
import { AppWorker } from '$lib/services/workers/_worker.services';
import type { CanisterSegment } from '$lib/types/canister';
import type { MissionControlId } from '$lib/types/mission-control';
import type {
	PostMessageDataResponseCanisterMonitoring,
	PostMessageDataResponseCanistersMonitoring,
	PostMessages
} from '$lib/types/post-message';

export class MonitoringWorker extends AppWorker {
	constructor(worker: Worker) {
		super(worker);

		worker.onmessage = ({ data }: MessageEvent<PostMessages>) => {
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
	}

	static async init(): Promise<MonitoringWorker> {
		const worker = await AppWorker.getInstance();
		return new MonitoringWorker(worker);
	}

	startMonitoringTimer = ({
		segments,
		missionControlId,
		withMonitoringHistory
	}: {
		segments: CanisterSegment[];
		missionControlId: MissionControlId;
		withMonitoringHistory: boolean;
	}) => {
		this._worker.postMessage({
			msg: 'startMonitoringTimer',
			data: { segments, missionControlId: missionControlId.toText(), withMonitoringHistory }
		});
	};

	stopMonitoringTimer = () => {
		this._worker.postMessage({
			msg: 'stopMonitoringTimer'
		});
	};

	restartMonitoringTimer = ({
		segments,
		missionControlId
	}: {
		segments: CanisterSegment[];
		missionControlId: MissionControlId;
	}) => {
		this._worker.postMessage({
			msg: 'restartMonitoringTimer',
			data: { segments, missionControlId: missionControlId.toText() }
		});
	};
}
