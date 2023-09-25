import type { PostMessage, PostMessageDataResponse } from '$lib/types/post-message';
import type { Principal } from '@dfinity/principal';

export type LedgerCallback = (data: PostMessageDataResponse) => void;

export const initLedgerWorker = async () => {
	const LedgerWorker = await import('$lib/workers/ledger.worker?worker');
	const worker: Worker = new LedgerWorker.default();

	let ledgerCallback: LedgerCallback | undefined;

	worker.onmessage = async ({ data }: MessageEvent<PostMessage<PostMessageDataResponse>>) => {
		const { msg } = data;

		switch (msg) {
			case 'customDomainRegistrationState':
				ledgerCallback?.(data.data);
				return;
		}
	};

	return {
		start: ({
			callback,
			missionControlId
		}: {
			missionControlId: Principal;
			callback: LedgerCallback;
		}) => {
			ledgerCallback = callback;

			worker.postMessage({
				msg: 'startLedgerTransactionsTimer',
				data: { missionControlId: missionControlId.toText() }
			});
		},
		stop: () => {
			worker.postMessage({
				msg: 'stopLedgerTransactionsTimer'
			});
		}
	};
};
