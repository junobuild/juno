import { consoleOrbiters } from '$lib/derived/console/segments.derived';
import { mctrlOrbiters } from '$lib/derived/mission-control/mission-control-orbiters.derived';
import { orbitersUncertifiedStore } from '$lib/stores/mission-control/orbiter.store';
import {
	type OrbiterConfigs,
	orbitersConfigsStore
} from '$lib/stores/orbiter/orbiter-configs.store';
import type { Orbiter } from '$lib/types/orbiter';
import { nonNullish } from '@dfinity/utils';
import { derived, type Readable } from 'svelte/store';

export const orbiters = derived(
	[consoleOrbiters, mctrlOrbiters],
	([$consoleOrbiters, $mctrlOrbiters]): Orbiter[] | undefined | null => {
		// Not yet fully loaded
		if ($consoleOrbiters === undefined || $mctrlOrbiters === undefined) {
			return undefined;
		}

		// No orbiter
		if ($consoleOrbiters.length === 0 && $mctrlOrbiters === null) {
			return null;
		}

		return [
			...($consoleOrbiters ?? []).filter(
				({ orbiter_id }) =>
					($mctrlOrbiters ?? []).find(
						({ orbiter_id: id }) => id.toText() === orbiter_id.toText()
					) === undefined
			),
			...($mctrlOrbiters ?? [])
		];
	}
);

export const orbiter: Readable<Orbiter | undefined | null> = derived(
	[orbiters],
	([$orbitersStore]) => $orbitersStore?.[0]
);

export const orbiterLoaded = derived(
	[orbitersUncertifiedStore],
	([$orbitersDataStore]) => $orbitersDataStore !== undefined
);

export const orbiterNotLoaded = derived([orbiterLoaded], ([$orbiterLoaded]) => !$orbiterLoaded);

export const orbiterConfigs: Readable<OrbiterConfigs | undefined> = derived(
	[orbiter, orbitersConfigsStore],
	([orbiterStore, orbitersConfigsStore]) =>
		nonNullish(orbiterStore) ? orbitersConfigsStore?.[orbiterStore.orbiter_id.toText()] : undefined
);
