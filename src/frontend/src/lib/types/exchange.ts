export interface ExchangePrice {
	usd: number;
	usdMarketCap?: number;
	usdVolume24h?: number;
	usdChange24h?: number;
	updatedAt: number; // Date.getTime()
}
