import { onSyncWorkflows, onWorkflowsError } from '$lib/services/wallet/workflows.loader.services';
import { AppWorker } from '$lib/services/workers/_worker.services';
import type {
	PostMessageDataResponseError,
	PostMessageDataResponseWorkflows,
	PostMessages
} from '$lib/types/post-message';
import type { SatelliteId } from '$lib/types/satellite';

export class WorkflowsWorker extends AppWorker {
	constructor(worker: Worker) {
		super(worker);

		worker.onmessage = ({ data }: MessageEvent<PostMessages>) => {
			const { msg } = data;

			switch (msg) {
				case 'syncWorkflows':
					onSyncWorkflows(data.data as PostMessageDataResponseWorkflows);
					return;
				case 'syncWorkflowsError':
					onWorkflowsError({
						error: (data.data as PostMessageDataResponseError).error
					});
			}
		};
	}

	static async init(): Promise<WorkflowsWorker> {
		const worker = await AppWorker.getInstance();
		return new WorkflowsWorker(worker);
	}

	start = ({ satelliteId }: { satelliteId: SatelliteId }) => {
		this._worker.postMessage({
			msg: 'startWorkflowsTimer',
			data: { satelliteId: satelliteId.toText() }
		});
	};

	restart = ({ satelliteId }: { satelliteId: SatelliteId }) => {
		this._worker.postMessage({
			msg: 'restartWorkflowsTimer',
			data: { satelliteId: satelliteId.toText() }
		});
	};

	stop = () => {
		this._worker.postMessage({
			msg: 'stopWorkflowsTimer'
		});
	};
}
