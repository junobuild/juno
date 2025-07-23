import type { ExchangePriceSchema } from '$lib/schemas/exchange.schema';
import type * as z from 'zod/v4';

export type ExchangePrice = z.infer<typeof ExchangePriceSchema>;
