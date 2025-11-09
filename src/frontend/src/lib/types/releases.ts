import type {
	CachedMetadataVersionsSchema,
	CachedReleasesSchema
} from '$lib/schemas/releases.schema';
import type * as z from 'zod';

export type CachedReleases = z.infer<typeof CachedReleasesSchema>;
export type CachedMetadataVersions = z.infer<typeof CachedMetadataVersionsSchema>;
