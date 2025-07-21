import * as z from 'zod/v4';

const TimestampSchema = z.number().refine(
	(val) => {
		const date = new Date(val);
		return !isNaN(date.getTime()) && val > 0;
	},
	{
		message: 'Invalid timestamp value'
	}
);

/**
 * A generic schema for a persisted value with its fetch timestamp.
 * Commonly use to save data in IDB.
 *
 * @param {z.ZodTypeAny} valueSchema - The schema for the value being cached.
 * @returns {z.ZodSchema} A schema representing the cached value.
 */
export const CachedValueSchema = <T extends z.ZodTypeAny>(valueSchema: T) =>
	z.strictObject({
		value: valueSchema.nullable(),
		createdAt: TimestampSchema,
		updatedAt: TimestampSchema
	});
