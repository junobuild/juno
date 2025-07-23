import { satelliteBuildVersion, satelliteVersion } from '$lib/api/satellites.deprecated.api';
import type { SatelliteVersionMetadata } from '$lib/types/version';
import { container } from '$lib/utils/juno.utils';
import { mapJunoPackageMetadata } from '$lib/utils/version.utils';
import type { Identity } from '@dfinity/agent';
import type { Principal } from '@dfinity/principal';
import { isNullish, nonNullish } from '@dfinity/utils';
import { getJunoPackage, satelliteBuildType } from '@junobuild/admin';

export const getSatelliteVersionMetadata = async ({
	satelliteId,
	identity
}: {
	satelliteId: Principal;
	identity: Identity;
}): Promise<
	{ metadata: Omit<SatelliteVersionMetadata, 'release'> | undefined } | { notFound: null }
> => {
	// Backwards compatibility for Satellite <= 0.0.14 which did not expose the end point "version_build"
	/**
	 * @deprecated - Replaced in Satellite > v0.0.22 with public custom section juno:package
	 */
	const queryBuildVersion = async (): Promise<string | undefined> => {
		try {
			return await satelliteBuildVersion({ satelliteId, identity });
		} catch (_: unknown) {
			return undefined;
		}
	};

	const [junoPkg] = await Promise.allSettled([
		getJunoPackage({
			moduleId: satelliteId,
			identity,
			...container()
		})
	]);

	if (junoPkg.status === 'fulfilled' && nonNullish(junoPkg.value)) {
		const pkg = junoPkg.value;
		const metadata = mapJunoPackageMetadata({ pkg });

		if (isNullish(metadata)) {
			return { notFound: null };
		}

		return { metadata };
	}

	// Legacy way of fetch build and version information
	const [version, buildVersion, buildType] = await Promise.allSettled([
		satelliteVersion({ satelliteId, identity }),
		queryBuildVersion(),
		satelliteBuildType({
			satellite: {
				satelliteId: satelliteId.toText(),
				identity,
				...container()
			}
		})
	]);

	if (version.status === 'rejected') {
		return { metadata: undefined };
	}

	const { value: current } = version;

	return {
		metadata: {
			current,
			...(buildVersion.status === 'fulfilled' &&
				nonNullish(buildVersion.value) && { currentBuild: buildVersion.value }),
			build: buildType.status === 'fulfilled' ? (buildType.value ?? 'stock') : 'stock'
		}
	};
};
