import * as z from 'zod/v4';

export const ExchangePriceSchema = z.object({
	usd: z.number(),
	usdMarketCap: z.number().optional(),
	usdVolume24h: z.number().optional(),
	usdChange24h: z.number().optional(),
	updatedAt: z.number() // Represents Date.getTime()
});
