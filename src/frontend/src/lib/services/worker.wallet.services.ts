import type { PostMessage, PostMessageDataResponse } from '$lib/types/post-message';
import type { Principal } from '@dfinity/principal';

export type WalletCallback = (data: PostMessageDataResponse) => void;

export interface WalletWorker {
	start: (params: { missionControlId: Principal; callback: WalletCallback }) => void;
	stop: () => void;
	reload: () => void;
}

export const initWalletWorker = async (): Promise<WalletWorker> => {
	const WalletWorker = await import('$lib/workers/wallet.worker?worker');
	const worker: Worker = new WalletWorker.default();

	let walletCallback: WalletCallback | undefined;

	worker.onmessage = async ({ data }: MessageEvent<PostMessage<PostMessageDataResponse>>) => {
		const { msg } = data;

		switch (msg) {
			case 'syncWallet':
				walletCallback?.(data.data);
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
		},
		reload: () => {
			worker.postMessage({
				msg: 'reloadWallet'
			});
		}
	};
};
