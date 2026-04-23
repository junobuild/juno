import type { MetadataUiSchema, MetadataUiTagsSchema } from '$lib/schemas/metadata.schema';
import type * as z from 'zod';

export type MetadataUiTags = z.infer<typeof MetadataUiTagsSchema>;
export type MetadataUi = z.infer<typeof MetadataUiSchema>;

// Alias for DID type
export type Metadata = [string, string][];
