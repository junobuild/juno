import * as z from 'zod';

const BinanceTickerPriceSchema = z.strictObject({
	symbol: z.string(),
	price: z.string()
});

const ExchangePriceSchema = z.strictObject({
	...BinanceTickerPriceSchema.shape,
	fetchedAt: z.iso.datetime()
});

export const ApiExchangePriceResponseSchema=  z.strictObject({
	price: ExchangePriceSchema
})