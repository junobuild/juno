import type { KongSwapTokenSchema, KongSwapTokensSchema } from '$lib/schema/kongswap.schema';
import type * as z from 'zod/v4';

export type KongSwapToken = z.infer<typeof KongSwapTokenSchema>;

export type KongSwapTokens = z.infer<typeof KongSwapTokensSchema>;
