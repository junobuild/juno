import * as z from 'zod/v4';

const AaguidSchema = z
	.string()
	.regex(
		/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
		'Invalid AAGUID format'
	);

export type Aaguid = z.infer<typeof AaguidSchema>;

const AaguidNameSchema = z.string();

export type AaguidName = z.infer<typeof AaguidNameSchema>;

export const PasskeyAaguidsSchema = z.record(AaguidSchema, AaguidNameSchema);
