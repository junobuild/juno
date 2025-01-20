import { PrincipalTextSchema } from '@dfinity/zod-schemas';
import * as z from 'zod';

const NumberAsStringSchema = z.string().refine((val) => !isNaN(Number(val)), {
	message: 'Invalid number string'
});

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
	market_cap: NumberAsStringSchema.nullable(),
	price: NumberAsStringSchema,
	price_change_24h: NumberAsStringSchema,
	total_supply: NumberAsStringSchema.nullable(),
	tvl: NumberAsStringSchema,
	updated_at: DateTimeSchema,
	volume_24h: NumberAsStringSchema
});

export const KongSwapTokenSchema = z.object({
	address: z.string().nullable(),
	canister_id: PrincipalTextSchema,
	decimals: z.number(),
	fee: z.number(),
	fee_fixed: z.string().nullable(),
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
