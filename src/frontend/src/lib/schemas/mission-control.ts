import { notEmptyString } from '@dfinity/utils';
import * as z from 'zod/v4';

export const SatelliteTagSchema = z.string().min(1).max(20);

const SatelliteTagsSchema = z.array(SatelliteTagSchema).max(10);

// DID data -> Frontend
export const SatelliteMetadataParser = z.preprocess((val) => {
	if (typeof val === 'string') {
		return val
			.split(',')
			.map((s) => s.trim())
			.filter(notEmptyString);
	}
	return val;
}, SatelliteTagsSchema);

// Frontend -> DID Data
export const SatelliteMetadataSerializer = SatelliteTagsSchema.optional().transform((tags) =>
	tags?.join(',')
);

// Metadata as loaded on the frontend side. See mission-control.did for Metadata Array<[string, string]>
export const SatelliteMetadataSchema = z.strictObject({
	name: z.string(),
	environment: z.string().optional(),
	tags: SatelliteTagsSchema.optional()
});
