import type { MissionControlDid } from '$declarations';
import { accountOrbiters } from '$lib/derived/console/account.derived';
import { mctrlOrbiters } from '$lib/derived/mission-control/orbiters.derived';
import { orbitersUncertifiedStore } from '$lib/stores/mission-control/orbiter.store';
import {
	type OrbiterConfigs,
	orbitersConfigsStore
} from '$lib/stores/orbiter/orbiter-configs.store';
import type { Orbiter } from '$lib/types/orbiter';
import { nonNullish } from '@dfinity/utils';
import { derived, type Readable } from 'svelte/store';

export const orbitersStore = derived(
	[accountOrbiters, mctrlOrbiters],
	([$accountOrbiters, $mctrlOrbiters]): Orbiter[] | undefined | null => {
		// Not yet loaded
		if ($mctrlOrbiters === undefined || $accountOrbiters === undefined) {
			return undefined;
		}

		// No orbiter
		if ($mctrlOrbiters === null && $accountOrbiters == null) {
			return null;
		}

		return [
			...($accountOrbiters ?? []).filter(
				({ orbiter_id }) =>
					($mctrlOrbiters ?? []).find(
						({ orbiter_id: id }) => id.toText() === orbiter_id.toText()
					) === undefined
			),
			...($mctrlOrbiters ?? [])
		];
	}
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
