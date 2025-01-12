import { SYNC_TOKENS_TIMER_INTERVAL } from '$lib/constants/constants';
import { fetchKongSwapTokens } from '$lib/rest/kongswap.rest';
import type { PostMessage, PostMessageDataRequest } from '$lib/types/post-message';

export const onTokensMessage = async ({
	data: dataMsg
}: MessageEvent<PostMessage<PostMessageDataRequest>>) => {
	const { msg } = dataMsg;

	switch (msg) {
		case 'stopWalletTimer':
			stopTokensTimer();
			return;
		case 'startWalletTimer':
			await startTokensTimer();
			return;
	}
};

let timer: NodeJS.Timeout | undefined = undefined;

const startTokensTimer = async () => {
	const sync = async () => await syncTokens();

	// We sync the cycles now but also schedule the update afterwards
	await sync();

	timer = setInterval(sync, SYNC_TOKENS_TIMER_INTERVAL);
};

const stopTokensTimer = () => {
	if (!timer) {
		return;
	}

	clearInterval(timer);
	timer = undefined;
};

let syncing = false;

let retry = 0;

const syncTokens = async () => {
	// We avoid to relaunch a sync while previous sync is not finished
	if (syncing) {
		return;
	}

	syncing = true;

	try {
		const data = await fetchKongSwapTokens();

		console.log('TOKENS:', data);

		// TODO: emit

		retry = 0;
	} catch (err: unknown) {
		console.error(err);

		// TODO: emit

		// We try few times but after a while we stop trying.
		if (retry >= 5) {
			stopTokensTimer();
			return;
		}

		retry++;
	} finally {
		syncing = false;
	}
};
