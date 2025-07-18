import { onRegistryError, onSyncRegistry } from '$lib/services/version/version.loader.services';
import { AppWorker } from '$lib/services/workers/_worker.services';
import type { CanisterSegment } from '$lib/types/canister';
import type {
	PostMessageDataResponseError,
	PostMessageDataResponseRegistry,
	PostMessages
} from '$lib/types/post-message';

export class RegistryWorker extends AppWorker {
	constructor(worker: Worker) {
		super(worker);

		worker.onmessage = ({ data }: MessageEvent<PostMessages>) => {
			const { msg } = data;

			switch (msg) {
				case 'syncRegistry':
					onSyncRegistry(data.data as PostMessageDataResponseRegistry);
					return;
				case 'syncRegistryError':
					onRegistryError({
						error: (data.data as PostMessageDataResponseError).error
					});
					return;
			}
		};
	}

	static async init(): Promise<RegistryWorker> {
		const worker = await AppWorker.getInstance();
		return new RegistryWorker(worker);
	}

	loadRegistry = ({ segments }: { segments: CanisterSegment[] }) => {
		this._worker.postMessage({
			msg: 'loadRegistry',
			data: { segments }
		});
	};
}
