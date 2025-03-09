// When we load the exchange data from idb we only consider those that are relatively actual - not older than a day in milliseconds
export const PRICE_VALIDITY_TIMEFRAME = 24 * 60 * 60 * 1000;
