import * as z from 'zod/v4';

export const AaguidSchema = z
	.string()
	.regex(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, 'Invalid AAGUID format');

const PasskeyAaguidSchema = z.strictObject({
	name: z.string(),
	icon_dark: z.base64().optional(),
	icon_light: z.base64().optional()
});

const PasskeyAaguidsSchema = z.record(AaguidSchema, PasskeyAaguidSchema);
