import { AppWorker } from '$lib/services/workers/_worker.services';
import type { CanisterSegment } from '$lib/types/canister';
import type {
	PostMessageDataResponseError, PostMessageDataResponseExchange, PostMessageDataResponseRegistry,
	PostMessageDataResponseWallet, PostMessageDataResponseWalletCleanUp,
	PostMessages
} from '$lib/types/post-message';
import {
	onSyncExchange,
	onSyncWallet,
	onWalletCleanUp,
	onWalletError
} from '$lib/services/wallet/wallet.loader.services';

export class RegistryWorker extends AppWorker {
	constructor(worker: Worker) {
		super(worker);

		worker.onmessage = ({ data }: MessageEvent<PostMessages>) => {
			const { msg } = data;

			switch (msg) {
				case 'syncRegistry':
					// TODO update version.store with data.data as PostMessageDataResponseRegistry
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
