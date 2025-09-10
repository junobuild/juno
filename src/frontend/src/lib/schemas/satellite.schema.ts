import { notEmptyString } from '@dfinity/utils';
import * as z from 'zod/v4';

export const SatelliteTagSchema = z.string().min(1).max(20);

export const SatelliteUiTagsSchema = z.array(SatelliteTagSchema).max(10);

// DID data -> Frontend
export const SatelliteUiMetadataParser = z.preprocess((val) => {
	if (typeof val === 'string') {
		return val
			.split(',')
			.map((s) => s.trim())
			.filter(notEmptyString);
	}
	return val;
}, SatelliteUiTagsSchema);

// Frontend -> DID Data
export const SatelliteUiMetadataSerializer = SatelliteUiTagsSchema.optional().transform((tags) =>
	tags?.join(',')
);

// Metadata as loaded on the frontend side. See mission-control.did for Metadata Array<[string, string]>
export const SatelliteUiMetadataSchema = z.strictObject({
	name: z.string(),
	environment: z.string().optional(),
	tags: SatelliteUiTagsSchema.optional()
});
