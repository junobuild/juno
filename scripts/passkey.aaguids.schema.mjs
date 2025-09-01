import { nonNullish } from '@dfinity/utils';
import * as z from 'zod/v4';

const DATA_URL_REGEX = /^data:([a-z]+\/[a-z0-9.+-]+);base64,([A-Za-z0-9+/]+={0,2})$/i;

const IconSchema = z
	.string()
	.regex(DATA_URL_REGEX, 'Expected base64 data URL (data:*;base64,...)')
	.refine(
		(s) => {
			const m = s.match(DATA_URL_REGEX);
			const [_, __, base64Value] = m ?? [];
			return nonNullish(m) && z.base64().safeParse(base64Value).success;
		},
		{ message: 'Invalid base64 payload' }
	);

const AaguidSchema = z
	.string()
	.regex(
		/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
		'Invalid AAGUID format'
	);

const PasskeyAaguidSchema = z.strictObject({
	name: z.string(),
	icon_dark: IconSchema.optional(),
	icon_light: IconSchema.optional()
});

export const PasskeyAaguidsSourceSchema = z.record(AaguidSchema, PasskeyAaguidSchema);
