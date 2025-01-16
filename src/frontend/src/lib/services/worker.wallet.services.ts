import { onSyncExchange } from '$lib/services/wallet.loader.services';
import type {
	PostMessage,
	PostMessageDataResponseError,
	PostMessageDataResponseExchange,
	PostMessageDataResponseWalletCleanUp,
	PostMessageDataResponseWallet
} from '$lib/types/post-message';
import type { Principal } from '@dfinity/principal';

export type WalletCallback = (data: PostMessageDataResponseWallet) => void;

export interface WalletWorker {
	start: (params: { missionControlId: Principal; callback: WalletCallback }) => void;
	stop: () => void;
}

export const initWalletWorker = async (): Promise<WalletWorker> => {
	const WalletWorker = await import('$lib/workers/workers?worker');
	const worker: Worker = new WalletWorker.default();

	let walletCallback: WalletCallback | undefined;

	worker.onmessage = ({
		data
	}: MessageEvent<
		PostMessage<
			| PostMessageDataResponseWallet
			| PostMessageDataResponseWalletCleanUp
			| PostMessageDataResponseError
			| PostMessageDataResponseExchange
		>
	>) => {
		const { msg } = data;

		switch (msg) {
			case 'syncWallet':
				walletCallback?.(data.data as PostMessageDataResponseWallet);
				return;
			case 'syncExchange':
				onSyncExchange(data.data as PostMessageDataResponseExchange);
				return;
		}
	};

	return {
		start: ({
			callback,
			missionControlId
		}: {
			missionControlId: Principal;
			callback: WalletCallback;
		}) => {
			walletCallback = callback;

			worker.postMessage({
				msg: 'startWalletTimer',
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
