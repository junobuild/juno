import { getIcpToCyclesConversionRate } from '$lib/api/cmc.api';
import { ICP_LEDGER_CANISTER_ID, SYNC_TOKENS_TIMER_INTERVAL } from '$lib/constants/app.constants';
import { icpToCyclesRateIdbStore } from '$lib/stores/app/idb.store';
import type {
	PostMessageDataResponseIcpToCyclesRate,
	PostMessageRequest
} from '$lib/types/post-message';
import { isNullish, nonNullish } from '@dfinity/utils';
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
	}
};

let timer: NodeJS.Timeout | undefined = undefined;

// Recursive setTimeout (not setInterval) so the rate sync cannot overlap
// itself. See #2522 / oisy-wallet#9706.
const scheduleNext = (): void => {
	timer = setTimeout(async () => {
		await syncRate();

		if (nonNullish(timer)) {
			scheduleNext();
		}
	}, SYNC_TOKENS_TIMER_INTERVAL);
};

const startTimer = async () => {
	if (nonNullish(timer)) {
		return;
	}

	// First we emit the value we already have in IDB
	await emitSavedRate();

	// We sync the cycles now but also schedule the update afterwards
	await syncRate();

	scheduleNext();
};

const stopTimer = () => {
	clearTimeout(timer);
	timer = undefined;
};

let retry = 0;

const syncRate = async () => {
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
		data: {
			rate: null
		}
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
