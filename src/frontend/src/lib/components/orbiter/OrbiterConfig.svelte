<script lang="ts">
	import { run } from 'svelte/legacy';

	import type { Principal } from '@dfinity/principal';
	import { fromNullable, isNullish, nonNullish } from '@dfinity/utils';
	import type { OrbiterSatelliteConfig } from '$declarations/orbiter/orbiter.did';
	import OrbiterConfigSave from '$lib/components/orbiter/OrbiterConfigSave.svelte';
	import Identifier from '$lib/components/ui/Identifier.svelte';
	import { listOrbiterSatelliteConfigs } from '$lib/services/orbiters.services';
	import { authStore } from '$lib/stores/auth.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { satellitesStore } from '$lib/stores/satellite.store';
	import { toasts } from '$lib/stores/toasts.store';
	import { versionStore } from '$lib/stores/version.store';
	import type { OrbiterSatelliteConfigEntry } from '$lib/types/ortbiter';
	import type { SatelliteIdText } from '$lib/types/satellite';
	import { satelliteName } from '$lib/utils/satellite.utils';

	interface Props {
		orbiterId: Principal;
	}

	let { orbiterId }: Props = $props();

	let configuration: Record<SatelliteIdText, OrbiterSatelliteConfigEntry> = $state({});

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

	run(() => {
		$versionStore, (async () => await load())();
	});

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
