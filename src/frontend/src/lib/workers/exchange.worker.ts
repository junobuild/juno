import { ICP_LEDGER_CANISTER_ID, SYNC_TOKENS_TIMER_INTERVAL } from '$lib/constants/app.constants';
import { PRICE_VALIDITY_TIMEFRAME } from '$lib/constants/exchange.constants';
import { fetchExchangePrice } from '$lib/rest/api.rest';
import { exchangeIdbStore } from '$lib/stores/app/idb.store';
import type { CanisterIdText } from '$lib/types/canister';
import type { ExchangePrice } from '$lib/types/exchange';
import type { PostMessageDataResponseExchange, PostMessageRequest } from '$lib/types/post-message';
import { isNullish } from '@dfinity/utils';
import { del, entries, set } from 'idb-keyval';

export const onExchangeMessage = async ({ data: dataMsg }: MessageEvent<PostMessageRequest>) => {
	const { msg } = dataMsg;

	switch (msg) {
		case 'stopWalletTimer':
			stopTimer();
			return;
		case 'startWalletTimer':
			await startTimer();
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

const exchangeRateICPToUsd = async (): Promise<ExchangePrice | undefined> => {
	const icp = await fetchExchangePrice({ ledgerId: ICP_LEDGER_CANISTER_ID });

	if (isNullish(icp)) {
		return undefined;
	}

	const {
		price: { price, fetchedAt }
	} = icp;

	return {
		usd: Number(price),
		updatedAt: new Date(fetchedAt).getTime()
	};
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
