import type { ApiExchangePriceResponseSchema } from '$lib/schemas/api.schema';
import type * as z from 'zod';

export type ApiExchangePriceResponse = z.infer<typeof ApiExchangePriceResponseSchema>;
