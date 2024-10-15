import type { Satellite } from '$declarations/mission_control/mission_control.did';
import { authStore } from '$lib/stores/auth.store';
import { i18n } from '$lib/stores/i18n.store';
import { satellitesStore } from '$lib/stores/satellite.store';
import { toasts } from '$lib/stores/toasts.store';
import { getMissionControlActor } from '$lib/utils/actor.juno.utils';
import type { Principal } from '@dfinity/principal';
import { assertNonNullish, isNullish, nonNullish, toNullable } from '@dfinity/utils';
import { get } from 'svelte/store';

interface CreateSatelliteConfig {
	name: string;
	subnetId?: Principal;
}

export const createSatellite = async ({
	missionControl,
	config: { name }
}: {
	missionControl: Principal | undefined | null;
	config: CreateSatelliteConfig;
}): Promise<Satellite | undefined> => {
	assertNonNullish(missionControl);

	const identity = get(authStore).identity;

	const { create_satellite } = await getMissionControlActor({
		missionControlId: missionControl,
		identity
	});
	return create_satellite(name);
};

export const createSatelliteWithConfig = async ({
	missionControl,
	config: { name, subnetId }
}: {
	missionControl: Principal | undefined | null;
	config: CreateSatelliteConfig;
}): Promise<Satellite | undefined> => {
	assertNonNullish(missionControl);

	const identity = get(authStore).identity;

	const { create_satellite_with_config } = await getMissionControlActor({
		missionControlId: missionControl,
		identity
	});
	return create_satellite_with_config({
		name: toNullable(name),
		subnet_id: toNullable(subnetId)
	});
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
		const identity = get(authStore).identity;

		const actor = await getMissionControlActor({ missionControlId: missionControl, identity });
		const satellites = await actor.list_satellites();

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		satellitesStore.set(satellites.map(([_, satellite]) => satellite));
	} catch (err: unknown) {
		const labels = get(i18n);

		toasts.error({
			text: labels.errors.satellites_loading,
			detail: err
		});

		satellitesStore.set(null);
	}
};
