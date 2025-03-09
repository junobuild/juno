import type { ExchangePriceSchema } from '$lib/schema/exchange.schema';
import * as z from 'zod';

export type ExchangePrice = z.infer<typeof ExchangePriceSchema>;
