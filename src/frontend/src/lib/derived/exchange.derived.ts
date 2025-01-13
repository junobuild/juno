import { ICP_LEDGER_CANISTER_ID } from '$lib/constants/constants';
import { exchangePricesCanisterDataStore } from '$lib/stores/exchange.store';
import { derived } from 'svelte/store';

export const exchangePrices = derived(
	[exchangePricesCanisterDataStore],
	([$exchangePricesCanisterDataStore]) => $exchangePricesCanisterDataStore
);

export const exchangePricesLoaded = derived(
	[exchangePricesCanisterDataStore],
	([$exchangePricesCanisterDataStore]) => $exchangePricesCanisterDataStore !== undefined
);

export const icpExchangePrice = derived(
	[exchangePrices],
	([$exchangePrices]) => $exchangePrices?.[ICP_LEDGER_CANISTER_ID]?.data
);
