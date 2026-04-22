import * as z from 'zod';

export const ExchangePriceSchema = z.object({
	usd: z.number(),
	updatedAt: z.number() // Represents Date.getTime()
});
