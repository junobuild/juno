import { ICP_LEDGER_CANISTER_ID, SYNC_TOKENS_TIMER_INTERVAL } from '$lib/constants/constants';
import { fetchKongSwapTokens } from '$lib/rest/kongswap.rest';
import type { ExchangePrice } from '$lib/types/exchange';
import type { KongSwapToken } from '$lib/types/kongswap';
import type { PostMessage, PostMessageDataRequest } from '$lib/types/post-message';
import { isNullish, nonNullish } from '@dfinity/utils';
import type {Canister} from "$lib/types/canister";

export const onExchangeMessage = async ({
	data: dataMsg
}: MessageEvent<PostMessage<PostMessageDataRequest>>) => {
	const { msg } = dataMsg;

	switch (msg) {
		case 'stopWalletTimer':
			stopTimer();
			return;
		case 'startWalletTimer':
			await startTimer();
			return;
	}
};

let timer: NodeJS.Timeout | undefined = undefined;

const startTimer = async () => {
	const sync = async () => await syncExchange();

	// We sync the cycles now but also schedule the update afterwards
	await sync();

	timer = setInterval(sync, SYNC_TOKENS_TIMER_INTERVAL);
};

const stopTimer = () => {
	if (!timer) {
		return;
	}

	clearInterval(timer);
	timer = undefined;
};

let syncing = false;

let retry = 0;

const syncExchange = async () => {
	// We avoid to relaunch a sync while previous sync is not finished
	if (syncing) {
		return;
	}

	syncing = true;

	try {
		const currentICPPrice = await exchangeRateICPToUsd();

		// TODO: emit

		retry = 0;
	} catch (err: unknown) {
		console.error(err);

		// TODO: emit

		// We try few times but after a while we stop trying.
		if (retry >= 3) {
			stopTimer();
			return;
		}

		retry++;
	} finally {
		syncing = false;
	}
};

// It seems KongSwap always returns ICP currently in second position. Maybe the answer is sorted?
const limit = 2;

const exchangeRateICPToUsd = async (): Promise<ExchangePrice | undefined> => {
	const icp = await findICPToken();

	if (isNullish(icp)) {
		return undefined;
	}

	const {
		metrics: { price, updated_at, market_cap, volume_24h, price_change_24h }
	} = icp;

	return {
		usd: Number(price),
		usdMarketCap: Number(market_cap),
		usdVolume24h: Number(volume_24h),
		usdChange24h: Number(price_change_24h),
		updatedAt: new Date(updated_at).getTime()
	};
};

const findICPToken = async (page = 1): Promise<KongSwapToken | undefined> => {
	const { tokens, total_count } = await fetchKongSwapTokens({ page, limit });

	const icp = tokens.find(({ canister_id }) => canister_id === ICP_LEDGER_CANISTER_ID);

	if (nonNullish(icp)) {
		return icp;
	}

	if (page * limit < total_count) {
		return await findICPToken(page + 1);
	}

	return undefined;
};

export const emitCanister = <T>(canister: Canister<T>) =>
	postMessage({
		msg: 'syncCanister',
		data: {
			canister
		}
	});