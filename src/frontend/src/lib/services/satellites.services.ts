import type { Satellite } from '$declarations/mission_control/mission_control.did';
import { i18n } from '$lib/stores/i18n.store';
import { satellitesStore } from '$lib/stores/satellite.store';
import { toasts } from '$lib/stores/toasts.store';
import { getMissionControlActor } from '$lib/utils/actor.utils';
import { assertNonNullish, isNullish, nonNullish } from '$lib/utils/utils';
import type { Principal } from '@dfinity/principal';
import { get } from 'svelte/store';

export const createSatellite = async ({
	missionControl,
	satelliteName
}: {
	missionControl: Principal | undefined | null;
	satelliteName: string;
}): Promise<Satellite | undefined> => {
	assertNonNullish(missionControl);

	const actor = await getMissionControlActor(missionControl);
	return actor.create_satellite(satelliteName);
};

export const loadSatellites = async ({
	missionControl,
	reload = false
}: {
	missionControl: Principal | undefined | null;
	reload?: boolean;
}) => {
	if (isNullish(missionControl)) {
		return;
	}

	// We load only once
	const satellites = get(satellitesStore);
	if (nonNullish(satellites) && !reload) {
		return;
	}

	try {
		const actor = await getMissionControlActor(missionControl);
		const satellites = await actor.list_satellites();

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		satellitesStore.set(satellites.map(([_, satellite]) => satellite));
	} catch (err: unknown) {
		const labels = get(i18n);

		toasts.error({
			text: labels.errors.satellites_loading,
			detail: err
		});
	}
};
