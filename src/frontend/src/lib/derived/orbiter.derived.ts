import { type OrbiterConfigs, orbitersConfigsStore } from '$lib/stores/orbiter-configs.store';
import { orbiterStore } from '$lib/stores/orbiter.store';
import { nonNullish } from '@dfinity/utils';
import { derived, type Readable } from 'svelte/store';

export const orbiterConfigs: Readable<OrbiterConfigs | undefined> = derived(
	[orbiterStore, orbitersConfigsStore],
	([orbiterStore, orbitersConfigsStore]) =>
		nonNullish(orbiterStore) ? orbitersConfigsStore?.[orbiterStore.orbiter_id.toText()] : undefined
);
