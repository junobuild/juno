import { PrincipalTextSchema } from '@dfinity/zod-schemas';
import * as z from 'zod/v4';

const DateTimeSchema = z.string().refine(
	(val) => {
		const parsed = new Date(val);
		return !isNaN(parsed.getTime());
	},
	{
		message: 'Invalid ISO 8601 datetime string'
	}
);

const KongSwapTokenMetricsSchema = z.object({
	price: z.number().nullable(),
	token_id: z.number(),
	total_supply: z.number().nullable(),
	market_cap: z.number().nullable(),
	updated_at: DateTimeSchema.nullable(),
	volume_24h: z.number().nullable(),
	tvl: z.number().nullable(),
	price_change_24h: z.number().nullable(),
	previous_price: z.number().nullable(),
	market_cap_rank: z.number().nullable(),
	is_verified: z.boolean()
});

export const KongSwapTokenSchema = z.object({
	address: z.string().nullable(),
	canister_id: PrincipalTextSchema,
	decimals: z.number(),
	fee: z.number(),
	fee_fixed: z.string().nullable(),
	has_custom_logo: z.boolean(),
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
	items: z.array(KongSwapTokenSchema),
	total_pages: z.number(),
	total_count: z.number(),
	page: z.number(),
	limit: z.number()
});
