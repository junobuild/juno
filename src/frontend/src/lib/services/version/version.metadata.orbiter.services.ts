import { orbiterVersion } from '$lib/api/orbiter.deprecated.api';
import type { VersionMetadata } from '$lib/types/version';
import { container } from '$lib/utils/juno.utils';
import type { Identity } from '@dfinity/agent';
import type { Principal } from '@dfinity/principal';
import { nonNullish } from '@dfinity/utils';
import { getJunoPackage } from '@junobuild/admin';

export const getOrbiterVersionMetadata = async ({
	orbiterId,
	identity
}: {
	orbiterId: Principal;
	identity: Identity;
}): Promise<{ metadata: Omit<VersionMetadata, 'release'> }> => {
	const [junoPkg] = await Promise.allSettled([
		getJunoPackage({
			moduleId: orbiterId,
			identity,
			...container()
		})
	]);

	if (junoPkg.status === 'fulfilled' && nonNullish(junoPkg.value)) {
		const pkg = junoPkg.value;
		const { version } = pkg;

		return {
			metadata: {
				current: version,
				pkg
			}
		};
	}

	// Legacy way of fetch build and version information
	const version = await orbiterVersion({ orbiterId, identity });

	return {
		metadata: {
			current: version
		}
	};
};
