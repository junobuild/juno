import { CachedReleasesSchema, CachedMetadataVersionsSchema } from '$lib/schemas/releases.schema';
import * as z from 'zod/v4';

export type CachedReleases = z.infer<typeof CachedReleasesSchema>;
export type CachedMetadataVersions = z.infer<typeof CachedMetadataVersionsSchema>;
