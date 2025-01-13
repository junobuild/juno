import { exchangePricesStore } from '$lib/stores/exchange.store';
import type { PostMessageDataResponse } from '$lib/types/post-message';
import { isNullish } from '@dfinity/utils';

export const onSyncExchange = (data: PostMessageDataResponse) => {
	if (isNullish(data.exchange)) {
		return;
	}

	const { exchange } = data;

	const entries = Object.entries(exchange);

    console.log(entries)

	for (const [canisterId, data] of entries) {
		if (isNullish(data)) {
			exchangePricesStore.reset(canisterId);
		} else {
			exchangePricesStore.set({ canisterId, data });
		}
	}
};
