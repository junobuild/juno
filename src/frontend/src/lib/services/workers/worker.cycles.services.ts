import {
	syncCanistersSyncData,
	syncCanisterSyncData
} from '$lib/services/canisters.loader.services';
import { AppWorker } from '$lib/services/workers/_worker.services';
import type { CanisterSegment } from '$lib/types/canister';
import type {
	PostMessageDataResponseCanistersSyncData,
	PostMessageDataResponseCanisterSyncData,
	PostMessages
} from '$lib/types/post-message';

export class CyclesWorker extends AppWorker {
	constructor(worker: Worker) {
		super(worker);

		worker.onmessage = ({ data }: MessageEvent<PostMessages>) => {
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
	}

	static async init(): Promise<CyclesWorker> {
		const worker = await AppWorker.getInstance();
		return new CyclesWorker(worker);
	}

	startCyclesTimer = ({ segments }: { segments: CanisterSegment[] }) => {
		this._worker.postMessage({
			msg: 'startCyclesTimer',
			data: { segments }
		});
	};

	stopCyclesTimer = () => {
		this._worker.postMessage({
			msg: 'stopCyclesTimer'
		});
	};

	restartCyclesTimer = (segments: CanisterSegment[]) => {
		this._worker.postMessage({
			msg: 'restartCyclesTimer',
			data: { segments }
		});
	};
}
