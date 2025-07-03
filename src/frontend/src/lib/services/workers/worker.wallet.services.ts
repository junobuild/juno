import {
	onSyncExchange,
	onSyncWallet,
	onWalletCleanUp,
	onWalletError
} from '$lib/services/wallet/wallet.loader.services';
import type { MissionControlId } from '$lib/types/mission-control';
import type {
	PostMessageDataResponseError,
	PostMessageDataResponseExchange,
	PostMessageDataResponseWallet,
	PostMessageDataResponseWalletCleanUp,
	PostMessages
} from '$lib/types/post-message';

export interface WalletWorker {
	start: (params: { missionControlId: MissionControlId }) => void;
	restart: (params: { missionControlId: MissionControlId }) => void;
	stop: () => void;
}

export const initWalletWorker = async (): Promise<WalletWorker> => {
	const WalletWorker = await import('$lib/workers/workers?worker');
	const worker: Worker = new WalletWorker.default();

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

	return {
		start: ({ missionControlId }: { missionControlId: MissionControlId }) => {
			worker.postMessage({
				msg: 'startWalletTimer',
				data: { missionControlId: missionControlId.toText() }
			});
		},
		restart: ({ missionControlId }: { missionControlId: MissionControlId }) => {
			worker.postMessage({
				msg: 'restartWalletTimer',
				data: { missionControlId: missionControlId.toText() }
			});
		},
		stop: () => {
			worker.postMessage({
				msg: 'stopWalletTimer'
			});
		}
	};
};
