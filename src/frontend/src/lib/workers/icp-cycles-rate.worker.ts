import { getIcpToCyclesConversionRate } from '$lib/api/cmc.api';
import { ICP_LEDGER_CANISTER_ID, SYNC_TOKENS_TIMER_INTERVAL } from '$lib/constants/app.constants';
import { icpToCyclesRateIdbStore } from '$lib/stores/app/idb.store';
import type {
	PostMessageDataResponseIcpToCyclesRate,
	PostMessageRequest
} from '$lib/types/post-message';
import { isNullish } from '@dfinity/utils';
import { del, get, set } from 'idb-keyval';

export const onIcpToCyclesRateMessage = async ({
	data: dataMsg
}: MessageEvent<PostMessageRequest>) => {
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
	const sync = async () => await syncRate();

	// First we emit the value we already have in IDB
	await emitSavedRate();

	// We sync the cycles now but also schedule the update afterwards
	await sync();

	timer = setInterval(sync, SYNC_TOKENS_TIMER_INTERVAL);
};

const stopTimer = () => {
	clearInterval(timer);
	timer = undefined;
};

let syncing = false;

let retry = 0;

const syncRate = async () => {
	// We avoid to relaunch a sync while previous sync is not finished
	if (syncing) {
		return;
	}

	syncing = true;

	try {
		const trillionRatio = await getIcpToCyclesConversionRate();

		await syncIcpToCyclesRate(trillionRatio);

		retry = 0;
	} catch (err: unknown) {
		console.error(err);

		await cleanIcpToCyclesRate();

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

const syncIcpToCyclesRate = async (rate: bigint) => {
	// Save information in indexed-db as well to load previous values on navigation and refresh
	await set(ICP_LEDGER_CANISTER_ID, rate, icpToCyclesRateIdbStore);

	const data: PostMessageDataResponseIcpToCyclesRate = {
		rate: {
			data: rate,
			certified: true
		}
	};

	postMessage({
		msg: 'syncIcpToCyclesRate',
		data
	});
};

const cleanIcpToCyclesRate = async () => {
	await del(ICP_LEDGER_CANISTER_ID, icpToCyclesRateIdbStore);

	postMessage({
		msg: 'syncIcpToCyclesRate',
		data: null
	});
};

const emitSavedRate = async () => {
	const rate = await get<bigint>(ICP_LEDGER_CANISTER_ID, icpToCyclesRateIdbStore);

	if (isNullish(rate)) {
		return;
	}

	const data: PostMessageDataResponseIcpToCyclesRate = {
		rate: {
			data: rate,
			certified: false
		}
	};

	postMessage({
		msg: 'syncIcpToCyclesRate',
		data
	});
};
