import { notEmptyString } from '@dfinity/utils';
import * as z from 'zod';

export const MetadataUiTagSchema = z.string().min(1).max(20);

export const MetadataUiTagsSchema = z.array(MetadataUiTagSchema).max(10);

// DID data -> Frontend
export const MetadataDeserializer = z.preprocess((val) => {
	if (typeof val === 'string') {
		return val
			.split(',')
			.map((s) => s.trim())
			.filter(notEmptyString);
	}
	return val;
}, MetadataUiTagsSchema);

// Frontend -> DID Data
export const MetadataSerializer = MetadataUiTagsSchema.optional().transform((tags) =>
	tags?.join(',')
);

// Metadata as loaded on the frontend side. See mission-control.did for Metadata Array<[string, string]>
export const MetadataUiSchema = z.strictObject({
	name: z.string(),
	environment: z.string().optional(),
	tags: MetadataUiTagsSchema.optional()
});
