import { releasesVersion } from '$lib/api/console.api';
import { missionControlVersion } from '$lib/api/mission-control.api';
import { satelliteVersion } from '$lib/api/satellites.api';
import { toasts } from '$lib/stores/toasts.store';
import { versionStore } from '$lib/stores/version.store';
import { fromNullable } from '$lib/utils/did.utils';
import { isNullish, nonNullish } from '$lib/utils/utils';
import type { Principal } from '@dfinity/principal';
import { get } from 'svelte/store';

export const loadVersion = async ({
	satelliteId,
	missionControlId
}: {
	satelliteId: Principal | undefined;
	missionControlId: Principal | undefined | null;
}) => {
	if (isNullish(missionControlId)) {
		return;
	}

	// We load the satellite version once per session
	// We might load the mission control version twice per session if user go to that view first and then to overview
	const store = get(versionStore);
	if (nonNullish(satelliteId) && nonNullish(store.satellites[satelliteId.toText()])) {
		return;
	}

	try {
		const empty = (): Promise<undefined> => Promise.resolve(undefined);

		const [satVersion, ctrlVersion, releases] = await Promise.all([
			nonNullish(satelliteId) ? satelliteVersion({ satelliteId }) : empty(),
			missionControlVersion({ missionControlId }),
			releasesVersion()
		]);

		versionStore.setMissionControl({
			release: fromNullable(releases.mission_control),
			current: ctrlVersion
		});

		if (isNullish(satelliteId)) {
			return;
		}

		versionStore.setSatellite({
			satelliteId: satelliteId.toText(),
			version: nonNullish(satVersion)
				? {
						release: fromNullable(releases.satellite),
						current: satVersion
				  }
				: undefined
		});
	} catch (err: unknown) {
		toasts.error({
			text: `Cannot fetch the versions information.`,
			detail: err
		});
	}
};
