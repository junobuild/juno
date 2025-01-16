import { ICP_LEDGER_CANISTER_ID, SYNC_TOKENS_TIMER_INTERVAL } from '$lib/constants/constants';
import { PRICE_VALIDITY_TIMEFRAME } from '$lib/constants/exchange.constants';
import { fetchKongSwapTokens } from '$lib/rest/kongswap.rest';
import { exchangeIdbStore } from '$lib/stores/idb.store';
import type { CanisterIdText } from '$lib/types/canister';
import type { ExchangePrice } from '$lib/types/exchange';
import type { KongSwapToken } from '$lib/types/kongswap';
import type { PostMessageDataResponseExchange, PostMessageRequest } from '$lib/types/post-message';
import { isNullish, nonNullish } from '@dfinity/utils';
import { del, entries, set } from 'idb-keyval';

export const onExchangeMessage = async ({ data: dataMsg }: MessageEvent<PostMessageRequest>) => {
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

	// First we emit the value we already have in IDB
	await emitSavedExchanges();

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
		const icpExchange = await exchangeRateICPToUsd();

		if (isNullish(icpExchange)) {
			await cleanExchangePrice();
			return;
		}

		await syncExchangePrice(icpExchange);

		retry = 0;
	} catch (err: unknown) {
		console.error(err);

		await cleanExchangePrice();

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
	const kongTokens = await fetchKongSwapTokens({ page, limit });

	if (isNullish(kongTokens)) {
		return undefined;
	}

	const { tokens, total_count } = kongTokens;

	const icp = tokens.find(({ canister_id }) => canister_id === ICP_LEDGER_CANISTER_ID);

	if (nonNullish(icp)) {
		return icp;
	}

	if (page * limit < total_count) {
		return await findICPToken(page + 1);
	}

	return undefined;
};

const syncExchangePrice = async (exchangePrice: ExchangePrice) => {
	// Save information in indexed-db as well to load previous values on navigation and refresh
	await set(ICP_LEDGER_CANISTER_ID, exchangePrice, exchangeIdbStore);

	const data: PostMessageDataResponseExchange = {
		exchange: {
			[ICP_LEDGER_CANISTER_ID]: exchangePrice
		}
	};

	postMessage({
		msg: 'syncExchange',
		data
	});
};

const cleanExchangePrice = async () => {
	await del(ICP_LEDGER_CANISTER_ID, exchangeIdbStore);

	const data: PostMessageDataResponseExchange = {
		exchange: {
			[ICP_LEDGER_CANISTER_ID]: null
		}
	};

	postMessage({
		msg: 'syncExchange',
		data
	});
};

const emitSavedExchanges = async () => {
	const exchanges = await entries<CanisterIdText, ExchangePrice>(exchangeIdbStore);

	const activeExchanges = exchanges.filter(
		([_, { updatedAt }]) => updatedAt > new Date().getTime() - PRICE_VALIDITY_TIMEFRAME
	);

	if (activeExchanges.length === 0) {
		return;
	}

	const exchange: PostMessageDataResponseExchange = activeExchanges.reduce(
		(acc, [canisterId, value]) => ({
			...acc,
			[canisterId]: value
		}),
		{}
	);

	postMessage({
		msg: 'syncExchange',
		data: {
			exchange
		}
	});
};
