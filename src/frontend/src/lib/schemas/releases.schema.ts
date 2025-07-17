import { CachedValueSchema } from '$lib/schemas/_cache.schema';
import { MetadataVersionsSchema, ReleasesSchema } from '@junobuild/admin';

export const CachedReleasesSchema = CachedValueSchema(ReleasesSchema);
export const CachedMetadataVersionsSchema = CachedValueSchema(MetadataVersionsSchema);
