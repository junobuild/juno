import { initCanisterDataStore } from '$lib/stores/canister-data.store';
import type { ExchangePrice } from '$lib/types/exchange';

export const exchangePricesStore = initCanisterDataStore<ExchangePrice>();
