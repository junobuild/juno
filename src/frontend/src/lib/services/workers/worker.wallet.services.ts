import {
	onSyncExchange,
	onSyncWallet,
	onWalletCleanUp,
	onWalletError
} from '$lib/services/wallet/wallet.loader.services';
import { AppWorker } from '$lib/services/workers/_worker.services';
import type { MissionControlId } from '$lib/types/mission-control';
import type {
	PostMessageDataResponseError,
	PostMessageDataResponseExchange,
	PostMessageDataResponseWallet,
	PostMessageDataResponseWalletCleanUp,
	PostMessages
} from '$lib/types/post-message';

export class WalletWorker extends AppWorker {
	constructor(worker: Worker) {
		super(worker);

		worker.onmessage = ({ data }: MessageEvent<PostMessages>) => {
			const { msg } = data;

			switch (msg) {
				case 'syncWallet':
					onSyncWallet(data.data as PostMessageDataResponseWallet);
					return;
				case 'syncWalletError':
					onWalletError({
						error: (data.data as PostMessageDataResponseError).error
					});
					return;
				case 'syncWalletCleanUp':
					onWalletCleanUp({
						transactionIds: (data.data as PostMessageDataResponseWalletCleanUp).transactionIds
					});
					return;
				case 'syncExchange':
					onSyncExchange(data.data as PostMessageDataResponseExchange);
					return;
			}
		};
	}

	static async init(): Promise<WalletWorker> {
		const worker = await AppWorker.getInstance();
		return new WalletWorker(worker);
	}

	start = ({ missionControlId }: { missionControlId: MissionControlId }) => {
		this._worker.postMessage({
			msg: 'startWalletTimer',
			data: { missionControlId: missionControlId.toText() }
		});
	};

	restart = ({ missionControlId }: { missionControlId: MissionControlId }) => {
		this._worker.postMessage({
			msg: 'restartWalletTimer',
			data: { missionControlId: missionControlId.toText() }
		});
	};

	stop = () => {
		this._worker.postMessage({
			msg: 'stopWalletTimer'
		});
	};
}
