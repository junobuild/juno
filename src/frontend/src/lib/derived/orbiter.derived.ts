import type { Orbiter } from '$declarations/mission_control/mission_control.did';
import { type OrbiterConfigs, orbitersConfigsStore } from '$lib/stores/orbiter-configs.store';
import { orbitersUncertifiedStore } from '$lib/stores/orbiter.store';
import { nonNullish } from '@dfinity/utils';
import { derived, type Readable } from 'svelte/store';

export const orbitersStore = derived(
	[orbitersUncertifiedStore],
	([$orbitersDataStore]) => $orbitersDataStore?.data
);

export const orbiterStore: Readable<Orbiter | undefined | null> = derived(
	[orbitersStore],
	([$orbitersStore]) => $orbitersStore?.[0]
);

export const orbiterLoaded = derived(
	[orbitersUncertifiedStore],
	([$orbitersDataStore]) => $orbitersDataStore !== undefined
);

export const orbiterNotLoaded = derived([orbiterLoaded], ([$orbiterLoaded]) => !$orbiterLoaded);

export const orbiterConfigs: Readable<OrbiterConfigs | undefined> = derived(
	[orbiterStore, orbitersConfigsStore],
	([orbiterStore, orbitersConfigsStore]) =>
		nonNullish(orbiterStore) ? orbitersConfigsStore?.[orbiterStore.orbiter_id.toText()] : undefined
);
