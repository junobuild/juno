import { CachedReleasesSchema, CachedVersionsSchema } from '$lib/schemas/registry.schema';
import * as z from 'zod/v4';

export type CachedReleases = z.infer<typeof CachedReleasesSchema>;
export type CachedVersions = z.infer<typeof CachedVersionsSchema>;
