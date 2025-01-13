import { KongSwapTokenSchema, type KongSwapTokensSchema } from '$lib/schema/kongswap.schema';
import * as z from 'zod';

export type KongSwapToken = z.infer<typeof KongSwapTokenSchema>;

export type KongSwapTokens = z.infer<typeof KongSwapTokensSchema>;
