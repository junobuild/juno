import { exchangePricesCanisterDataStore } from '$lib/stores/exchange.store';
import type { PostMessageDataResponse } from '$lib/types/post-message';
import { isNullish } from '@dfinity/utils';

export const onSyncExchange = (data: PostMessageDataResponse) => {
	if (isNullish(data.exchange)) {
		return;
	}

	const { exchange } = data;

	const entries = Object.entries(exchange);

	for (const [canisterId, data] of entries) {
		if (isNullish(data)) {
			exchangePricesCanisterDataStore.reset(canisterId);
		} else {
			exchangePricesCanisterDataStore.set({ canisterId, data });
		}
	}
};
