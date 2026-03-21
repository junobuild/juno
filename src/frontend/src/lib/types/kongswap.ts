import type { KongSwapTokenSchema } from '$lib/schemas/kongswap.schema';
import type * as z from 'zod';

export type KongSwapToken = z.infer<typeof KongSwapTokenSchema>;
