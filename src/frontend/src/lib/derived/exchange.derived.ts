import { ICP_LEDGER_CANISTER_ID } from '$lib/constants/constants';
import { exchangePricesCanisterDataStore } from '$lib/stores/exchange.store';
import { nonNullish } from '@dfinity/utils';
import { derived } from 'svelte/store';

export const exchangePrices = derived(
	[exchangePricesCanisterDataStore],
	([$exchangePricesCanisterDataStore]) => $exchangePricesCanisterDataStore
);

export const exchangePricesLoaded = derived(
	[exchangePricesCanisterDataStore],
	([$exchangePricesCanisterDataStore]) => $exchangePricesCanisterDataStore !== undefined
);

export const exchangePricesNotLoaded = derived(
	[exchangePricesLoaded],
	([$exchangePricesLoaded]) => !$exchangePricesLoaded
);

export const icpToUsd = derived(
	[exchangePrices],
	([$exchangePrices]) => $exchangePrices?.[ICP_LEDGER_CANISTER_ID]?.data?.usd
);

export const icpToUsdDefined = derived(
	[icpToUsd],
	([$icpToUsd]) => nonNullish($icpToUsd) && $icpToUsd > 0
);
