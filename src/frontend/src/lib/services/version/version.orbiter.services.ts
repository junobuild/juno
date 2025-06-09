import type { Orbiter } from '$declarations/mission_control/mission_control.did';
import { orbiterVersion } from '$lib/api/orbiter.deprecated.api';
import { getNewestReleasesMetadata } from '$lib/rest/cdn.rest';
import { versionStore } from '$lib/stores/version.store';
import type { OptionIdentity } from '$lib/types/itentity';
import type { Option } from '$lib/types/utils';
import type { VersionMetadata } from '$lib/types/version';
import { container } from '$lib/utils/juno.utils';
import type { Principal } from '@dfinity/principal';
import { assertNonNullish, isNullish, nonNullish } from '@dfinity/utils';
import { getJunoPackage } from '@junobuild/admin';
import { get } from 'svelte/store';

export const loadOrbiterVersion = async ({
	orbiter,
	reload,
	identity
}: {
	orbiter: Option<Orbiter>;
	reload: boolean;
	identity: OptionIdentity;
}) => {
	// Optional for convenience reasons.
	if (isNullish(orbiter)) {
		return;
	}

	// We load the orbiter version once per session or when explicitly needed
	const store = get(versionStore);
	if (nonNullish(store.orbiter) && !reload) {
		return;
	}

	// Optional for convenience reasons. A guard prevent the usage of the service while not being sign-in.
	assertNonNullish(identity);

	const orbiterInfo = async (orbiterId: Principal): Promise<Omit<VersionMetadata, 'release'>> => {
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
				current: version,
				pkg
			};
		}

		// Legacy way of fetch build and version information
		const version = await orbiterVersion({ orbiterId, identity });

		return {
			current: version
		};
	};

	const [orbVersion, releases] = await Promise.all([
		orbiterInfo(orbiter.orbiter_id),
		// TODO: we can probably improve - reduce the number of queries on the CDN - by caching in store the releases metadata
		// instead of re-querying those every time separately.
		getNewestReleasesMetadata()
	]);

	versionStore.setOrbiter({
		release: releases.orbiter,
		...orbVersion
	});
};
