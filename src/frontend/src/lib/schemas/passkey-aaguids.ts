import * as z from 'zod';

const AaguidKeySchema = z
	.string()
	.regex(
		/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
		'Invalid AAGUID format'
	);

export type AaguidKey = z.infer<typeof AaguidKeySchema>;

const AaguidSchema = z.strictObject({
	name: z.string(),
	noLogo: z.boolean().optional()
});

export type Aaguid = z.infer<typeof AaguidSchema>;

export const PasskeyAaguidsSchema = z.record(AaguidKeySchema, AaguidSchema);
