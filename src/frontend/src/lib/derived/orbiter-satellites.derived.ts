import { orbiterConfigs } from '$lib/derived/orbiter.derived';
import { satellitesStore } from '$lib/derived/satellites.derived';
import type { OrbiterDid } from '$lib/types/declarations';
import type { OrbiterSatelliteConfigEntry } from '$lib/types/orbiter';
import type { SatelliteIdText } from '$lib/types/satellite';
import { satelliteName } from '$lib/utils/satellite.utils';
import { first } from '$lib/utils/utils';
import type { Principal } from '@dfinity/principal';
import { fromNullable, fromNullishNullable, nonNullish } from '@dfinity/utils';
import { derived, type Readable } from 'svelte/store';

export const orbiterSatellitesConfig: Readable<
	Record<SatelliteIdText, OrbiterSatelliteConfigEntry>
> = derived([orbiterConfigs, satellitesStore], ([orbiterConfigsStore, satellitesStore]) =>
	(satellitesStore ?? []).reduce((acc, satellite) => {
		const config: [Principal, OrbiterDid.OrbiterSatelliteConfig] | undefined = (
			orbiterConfigsStore ?? []
		).find(([satelliteId, _]) => satelliteId.toText() === satellite.satellite_id.toText());

		const entry = config?.[1];
		const enabled = nonNullish(fromNullishNullable(entry?.features));

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

// Currently we duplicate the configuration for each Satellites that way the UI remains simple - a single configuration for the features
export const orbiterFeatures: Readable<OrbiterDid.OrbiterSatelliteFeatures | undefined> = derived(
	[orbiterSatellitesConfig],
	([orbiterSatellitesConfig]) =>
		fromNullable(
			first(
				Object.entries(orbiterSatellitesConfig).filter(([_, { enabled }]) => enabled) ?? []
			)?.[1]?.config?.features ?? []
		)
);
