import type { Orbiter } from '$declarations/mission_control/mission_control.did';
import { i18n } from '$lib/stores/i18n.store';
import { orbitersStore } from '$lib/stores/orbiter.store';
import { toasts } from '$lib/stores/toasts.store';
import { getMissionControlActor } from '$lib/utils/actor.juno.utils';
import { toNullable } from '$lib/utils/did.utils';
import { assertNonNullish, isNullish, nonNullish } from '$lib/utils/utils';
import type { Principal } from '@dfinity/principal';
import { get } from 'svelte/store';

export const createOrbiter = async ({
	missionControl,
	orbiterName
}: {
	missionControl: Principal | undefined | null;
	orbiterName?: string;
}): Promise<Orbiter | undefined> => {
	assertNonNullish(missionControl);

	const actor = await getMissionControlActor(missionControl);
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
		const actor = await getMissionControlActor(missionControl);
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
