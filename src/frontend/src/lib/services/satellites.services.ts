import type { Satellite } from '$declarations/mission_control/mission_control.did';
import { getMissionControlActor } from '$lib/api/actors/actor.juno.api';
import { satellitesStore } from '$lib/derived/satellite.derived';
import { authStore } from '$lib/stores/auth.store';
import { i18n } from '$lib/stores/i18n.store';
import { satellitesDataStore } from '$lib/stores/satellite.store';
import { toasts } from '$lib/stores/toasts.store';
import type { Option } from '$lib/types/utils';
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
	missionControl: Option<Principal>;
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
	missionControl: Option<Principal>;
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
	missionControl: Option<Principal>;
	reload?: boolean;
}): Promise<{ result: 'skip' | 'success' | 'error' }> => {
	if (isNullish(missionControl)) {
		return { result: 'skip' };
	}

	// We load only once
	const satellites = get(satellitesStore);
	if (nonNullish(satellites) && !reload) {
		return { result: 'skip' };
	}

	try {
		const identity = get(authStore).identity;

		const { list_satellites } = await getMissionControlActor({
			missionControlId: missionControl,
			identity
		});
		const satellites = await list_satellites();

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		satellitesDataStore.set(satellites.map(([_, satellite]) => satellite));

		return { result: 'success' };
	} catch (err: unknown) {
		const labels = get(i18n);

		toasts.error({
			text: labels.errors.satellites_loading,
			detail: err
		});

		satellitesDataStore.reset();

		return { result: 'error' };
	}
};
