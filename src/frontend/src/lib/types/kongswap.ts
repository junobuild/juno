import { z } from 'zod';

const MetricsSchema = z.object({
	market_cap: z.string(),
	price: z.string(),
	price_change_24h: z.string(),
	total_supply: z.string(),
	tvl: z.string(),
	updated_at: z.string(), // ISO date string
	volume_24h: z.string()
});

const KongSwapTokenSchema = z.object({
	address: z.string().nullable(),
	canister_id: z.string(),
	decimals: z.number(),
	fee: z.number(),
	fee_fixed: z.string(),
	icrc1: z.boolean(),
	icrc2: z.boolean(),
	icrc3: z.boolean(),
	is_removed: z.boolean(),
	logo_url: z.string().nullable(),
	metrics: MetricsSchema,
	name: z.string(),
	symbol: z.string(),
	token_id: z.number(),
	token_type: z.string()
});

const KongSwapTokensSchema = z.object({
	tokens: z.array(KongSwapTokenSchema),
    total_count: z.number()
});
