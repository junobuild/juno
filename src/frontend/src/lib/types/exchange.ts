import type { ExchangePriceSchema } from '$lib/schemas/exchange.schema';
import type * as z from 'zod';

export type ExchangePrice = z.infer<typeof ExchangePriceSchema>;
