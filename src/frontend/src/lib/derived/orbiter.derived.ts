import type { Orbiter } from '$declarations/mission_control/mission_control.did';
import { type OrbiterConfigs, orbitersConfigsStore } from '$lib/stores/orbiter-configs.store';
import { orbitersStore } from '$lib/stores/orbiter.store';
import { nonNullish } from '@dfinity/utils';
import { derived, type Readable } from 'svelte/store';

export const orbiterStore: Readable<Orbiter | undefined | null> = derived(
	[orbitersStore],
	([orbiterStore]) => orbiterStore?.[0]
);
export const orbiterConfigs: Readable<OrbiterConfigs | undefined> = derived(
	[orbiterStore, orbitersConfigsStore],
	([orbiterStore, orbitersConfigsStore]) =>
		nonNullish(orbiterStore) ? orbitersConfigsStore?.[orbiterStore.orbiter_id.toText()] : undefined
);
