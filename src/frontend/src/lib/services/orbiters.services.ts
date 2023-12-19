import type { Orbiter } from '$declarations/mission_control/mission_control.did';
import { authStore } from '$lib/stores/auth.store';
import { i18n } from '$lib/stores/i18n.store';
import { orbitersStore } from '$lib/stores/orbiter.store';
import { toasts } from '$lib/stores/toasts.store';
import { getMissionControlActor } from '$lib/utils/actor.juno.utils';
import type { Principal } from '@dfinity/principal';
import { assertNonNullish, isNullish, nonNullish, toNullable } from '@dfinity/utils';
import { get } from 'svelte/store';

export const createOrbiter = async ({
	missionControl,
	orbiterName
}: {
	missionControl: Principal | undefined | null;
	orbiterName?: string;
}): Promise<Orbiter | undefined> => {
	assertNonNullish(missionControl);

	const identity = get(authStore).identity;

	const actor = await getMissionControlActor({ missionControlId: missionControl, identity });
	return actor.create_orbiter(toNullable(orbiterName));
};

export const loadOrbiters = async ({
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
	const orbiters = get(orbitersStore);
	if (nonNullish(orbiters) && !reload) {
		return;
	}

	try {
		const identity = get(authStore).identity;

		const actor = await getMissionControlActor({ missionControlId: missionControl, identity });
		const orbiters = await actor.list_orbiters();

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		orbitersStore.set(orbiters.map(([_, orbiter]) => orbiter));
	} catch (err: unknown) {
		const labels = get(i18n);

		toasts.error({
			text: labels.errors.orbiters_loading,
			detail: err
		});
	}
};
