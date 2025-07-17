import { CachedValueSchema } from '$lib/schemas/_cache.schema';
import { BuildTypeSchema, MetadataVersionSchema } from '@junobuild/admin';
import { JunoPackageSchema } from '@junobuild/config';
import * as z from 'zod/v4';

/**
 * Schema for the metadata of a version.
 */
export const VersionMetadataSchema = z.strictObject({
	/**
	 * The latest related release published by Juno.
	 */
	release: MetadataVersionSchema,

	/**
	 * The version of the module as published by Juno and required in the eco-system.
	 *
	 * For the Satellite:
	 * - If stock (no dependencies), then pkg.version.
	 * - If serverless functions, then pkg.dependencies['junobuild/satellite'].version.
	 */
	current: MetadataVersionSchema,

	pkg: JunoPackageSchema.optional()
});

/**
 * Schema for the version metadata of a Satellite.
 */
export const SatelliteVersionMetadataSchema = z.strictObject({
	...VersionMetadataSchema.shape,
	/**
	 * @deprecated use JunoPackage instead
	 */
	currentBuild: z.string().optional(),

	/**
	 * @deprecated use JunoPackage instead
	 */
	build: BuildTypeSchema
});

export const CachedVersionMetadataSchema = CachedValueSchema(
	VersionMetadataSchema.omit({ release: true })
);

export const CachedSatelliteVersionMetadataSchema = CachedValueSchema(
	SatelliteVersionMetadataSchema.omit({ release: true })
);
