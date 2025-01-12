import { PrincipalTextSchema } from '$lib/types/principal';
import { z } from 'zod';

const NumberAsStringSchema = z.string().refine((val) => !isNaN(Number(val)), {
	message: 'Invalid number string'
});

const KongSwapTokenMetricsSchema = z.object({
	market_cap: NumberAsStringSchema,
	price: NumberAsStringSchema,
	price_change_24h: NumberAsStringSchema,
	total_supply: NumberAsStringSchema,
	tvl: NumberAsStringSchema,
	updated_at: z.string().datetime(),
	volume_24h: NumberAsStringSchema
});

const KongSwapTokenSchema = z.object({
	address: z.string().nullable(),
	canister_id: PrincipalTextSchema,
	decimals: z.number(),
	fee: z.number(),
	fee_fixed: z.string(),
	icrc1: z.boolean(),
	icrc2: z.boolean(),
	icrc3: z.boolean(),
	is_removed: z.boolean(),
	logo_url: z.string().nullable(),
	metrics: KongSwapTokenMetricsSchema,
	name: z.string(),
	symbol: z.string(),
	token_id: z.number(),
	token_type: z.string()
});

export const KongSwapTokensSchema = z.object({
	tokens: z.array(KongSwapTokenSchema),
	total_count: z.number()
});

export type KongSwapTokens = z.infer<typeof KongSwapTokensSchema>;
