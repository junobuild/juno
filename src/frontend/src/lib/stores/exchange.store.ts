import { initCanisterDataStore } from '$lib/stores/_canister-data.store';
import type { ExchangePrice } from '$lib/types/exchange';

export const exchangePricesCanisterDataStore = initCanisterDataStore<ExchangePrice>();
