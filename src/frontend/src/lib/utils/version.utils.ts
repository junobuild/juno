import type { SatelliteVersionMetadata } from '$lib/types/version';
import { isNullish } from '@dfinity/utils';
import { findJunoPackageDependency } from '@junobuild/admin';
import { JUNO_PACKAGE_SATELLITE_ID, type JunoPackage } from '@junobuild/config';

export const mapJunoPackageMetadata = ({
	pkg
}: {
	pkg: JunoPackage;
}): Pick<SatelliteVersionMetadata, 'current' | 'pkg' | 'build'> | undefined => {
	const { name, dependencies, version } = pkg;

	// It's stock
	if (name === JUNO_PACKAGE_SATELLITE_ID) {
		return {
			current: version,
			pkg,
			build: 'stock'
		};
	}

	const satelliteDependency = findJunoPackageDependency({
		dependencies,
		dependencyId: JUNO_PACKAGE_SATELLITE_ID
	});

	if (isNullish(satelliteDependency)) {
		return undefined;
	}

	const [_, satelliteVersion] = satelliteDependency;

	return {
		current: satelliteVersion,
		pkg,
		build: 'extended'
	};
};
