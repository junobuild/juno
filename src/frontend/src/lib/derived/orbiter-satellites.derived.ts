import type { OrbiterSatelliteConfig } from '$declarations/orbiter/orbiter.did';
import { orbiterConfigs } from '$lib/derived/orbiter.derived';
import { satellitesStore } from '$lib/stores/satellite.store';
import type { OrbiterSatelliteConfigEntry } from '$lib/types/ortbiter';
import type { SatelliteIdText } from '$lib/types/satellite';
import { satelliteName } from '$lib/utils/satellite.utils';
import type { Principal } from '@dfinity/principal';
import { fromNullable, nonNullish } from '@dfinity/utils';
import { derived, type Readable } from 'svelte/store';

export const orbiterSatellitesConfig: Readable<
	Record<SatelliteIdText, OrbiterSatelliteConfigEntry>
> = derived([orbiterConfigs, satellitesStore], ([orbiterConfigsStore, satellitesStore]) =>
	(satellitesStore ?? []).reduce((acc, satellite) => {
		const config: [Principal, OrbiterSatelliteConfig] | undefined = (
			orbiterConfigsStore ?? []
		).find(([satelliteId, _]) => satelliteId.toText() === satellite.satellite_id.toText());

		const entry = config?.[1];
		const enabled = nonNullish(fromNullable(entry?.features ?? []));

		return {
			...acc,
			[satellite.satellite_id.toText()]: {
				name: satelliteName(satellite),
				enabled,
				config: config?.[1]
			}
		};
	}, {})
);
