<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store';
	import type { Principal } from '@dfinity/principal';
	import { toasts } from '$lib/stores/toasts.store';
	import { satellitesStore } from '$lib/stores/satellite.store';
	import type { SatelliteIdText } from '$lib/types/satellite';
	import { satelliteName } from '$lib/utils/satellite.utils';
	import Identifier from '$lib/components/ui/Identifier.svelte';
	import type { OrbiterSatelliteConfig } from '$declarations/orbiter/orbiter.did';
	import OrbiterConfigSave from '$lib/components/orbiter/OrbiterConfigSave.svelte';
	import type { OrbiterSatelliteConfigEntry } from '$lib/types/ortbiter';
	import { authStore } from '$lib/stores/auth.store';
	import { fromNullable, isNullish, nonNullish } from '@dfinity/utils';
	import { listOrbiterSatelliteConfigs } from '$lib/services/orbiters.services';
	import { versionStore } from '$lib/stores/version.store';

	export let orbiterId: Principal;

	let configuration: Record<SatelliteIdText, OrbiterSatelliteConfigEntry> = {};

	const list = (orbiterVersion: string): Promise<[Principal, OrbiterSatelliteConfig][]> =>
		listOrbiterSatelliteConfigs({ orbiterId, identity: $authStore.identity, orbiterVersion });

	const load = async () => {
		if (isNullish($versionStore.orbiter?.current)) {
			return;
		}

		try {
			const configs = await list($versionStore.orbiter.current);
			loadConfig(configs);
		} catch (err: unknown) {
			toasts.error({
				text: $i18n.errors.orbiter_configuration_listing,
				detail: err
			});
		}
	};

	const loadConfig = (configs: [Principal, OrbiterSatelliteConfig][]) => {
		configuration = ($satellitesStore ?? []).reduce((acc, satellite) => {
			const config: [Principal, OrbiterSatelliteConfig] | undefined = (configs ?? []).find(
				([satelliteId, _]) => satelliteId.toText() === satellite.satellite_id.toText()
			);

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
		}, {});
	};

	$: $versionStore, (async () => await load())();

	// [Principal, SatelliteConfig]
	const onUpdate = ({ detail }: CustomEvent<[Principal, OrbiterSatelliteConfig][]>) => {
		loadConfig(detail);
	};
</script>

<div class="table-container">
	<table>
		<thead>
			<tr>
				<th class="tools"> {$i18n.analytics.enabled} </th>
				<th class="origin"> {$i18n.satellites.satellite} </th>
				<th class="origin"> {$i18n.satellites.id} </th>
			</tr>
		</thead>
		<tbody>
			{#each Object.entries(configuration) as conf}
				{@const satelliteId = conf[0]}
				{@const entry = conf[1]}

				<tr>
					<td class="actions">
						<input type="checkbox" bind:checked={conf[1].enabled} />
					</td>

					<td>
						{entry.name}
					</td>

					<td>
						<Identifier identifier={satelliteId} shorten={false} small={false} />
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

{#if ($satellitesStore ?? []).length > 0}
	<OrbiterConfigSave {orbiterId} config={configuration} on:junoConfigUpdate={onUpdate} />
{/if}

<style lang="scss">
	.tools {
		width: 88px;
	}

	input[type='checkbox'] {
		margin: 0;
	}
</style>
