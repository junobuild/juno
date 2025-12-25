import { missionControlVersion } from '$lib/api/mission-control.deprecated.api';
import type { VersionMetadata } from '$lib/types/version';
import { container } from '$lib/utils/juno.utils';
import { nonNullish } from '@dfinity/utils';
import type { Identity } from '@icp-sdk/core/agent';
import type { Principal } from '@icp-sdk/core/principal';
import { getJunoPackage } from '@junobuild/admin';

export const getMissionControlVersionMetadata = async ({
	missionControlId,
	identity
}: {
	missionControlId: Principal;
	identity: Identity;
}): Promise<{ metadata: Omit<VersionMetadata, 'release'> | undefined }> => {
	const [junoPkg] = await Promise.allSettled([
		getJunoPackage({
			moduleId: missionControlId,
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

	try {
		// Legacy way of fetch build and version information
		const version = await missionControlVersion({ missionControlId, identity });

		return {
			metadata: {
				current: version
			}
		};
	} catch (_err: unknown) {
		return { metadata: undefined };
	}
};
