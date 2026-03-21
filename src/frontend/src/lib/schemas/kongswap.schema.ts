import { PrincipalTextSchema } from '@junobuild/schema';
import * as z from 'zod';

const DateTimeSchema = z
	.string()
	.refine((val) => !isNaN(new Date(val).getTime()), { message: 'Invalid ISO date' });

const KongSwapTokenMetricsSchema = z.object({
	token_id: z.number(),
	total_supply: z.number().nullable(),
	market_cap: z.number().nullable(),
	price: z.number().nullable(),
	updated_at: DateTimeSchema,
	volume_24h: z.number().nullable(),
	tvl: z.number().nullable(),
	price_change_24h: z.number().nullable(),
	previous_price: z.number().nullable(),
	is_verified: z.boolean()
});

const KongSwapTokenBaseSchema = z.object({
	token_id: z.number(),
	name: z.string(),
	symbol: z.string(),
	canister_id: PrincipalTextSchema,
	address: z.string().nullable(),
	decimals: z.number(),
	fee: z.number(),
	fee_fixed: z.string().nullable(),
	has_custom_logo: z.boolean(),
	icrc1: z.boolean(),
	icrc2: z.boolean(),
	icrc3: z.boolean(),
	is_removed: z.boolean(),
	logo_url: z.string().nullable(),
	logo_updated_at: DateTimeSchema.nullable(),
	token_type: z.string()
});

export const KongSwapTokenSchema = z.object({
	token: KongSwapTokenBaseSchema,
	metrics: KongSwapTokenMetricsSchema
});
