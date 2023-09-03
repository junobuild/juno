<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store';
	import type { Principal } from '@dfinity/principal';
	import { toasts } from '$lib/stores/toasts.store';
	import { onMount } from 'svelte';
	import { listOrbiterSatelliteConfigs } from '$lib/api/orbiter.api';
	import { satellitesStore } from '$lib/stores/satellite.store';
	import type { SatelliteIdText } from '$lib/types/satellite';
	import { satelliteName } from '$lib/utils/satellite.utils';
	import Identifier from '$lib/components/ui/Identifier.svelte';
	import type { SatelliteConfig } from '$declarations/orbiter/orbiter.did';
	import OrbiterConfigSave from '$lib/components/analytics/OrbiterConfigSave.svelte';
	import type {OrbiterSatelliteConfigEntry} from "$lib/types/ortbiter";

	export let orbiterId: Principal;

	let configuration: Record<SatelliteIdText, OrbiterSatelliteConfigEntry> = {};

	const list = (): Promise<[Principal, SatelliteConfig][]> =>
		listOrbiterSatelliteConfigs({ orbiterId });

	const load = async () => {
		try {
			const configs = await list();

			configuration = ($satellitesStore ?? []).reduce((acc, satellite) => {
				const config: SatelliteConfig | undefined = (configs ?? []).find(
						([satelliteId, _]) => satelliteId.toText() === satellite.satellite_id.toText()
				);

				return {
					...acc,
					[satellite.satellite_id.toText()]: {
						name: satelliteName(satellite),
						enabled: config?.[1].enabled ?? true,
						config: config?.[1]
					}
				};
			}, {});
		} catch (err: unknown) {
			toasts.error({
				text: $i18n.errors.orbiter_configuration_listing,
				detail: err
			});
		}
	};

	onMount(async () => await load());
</script>

<div class="table-container">
	<table>
		<thead>
			<tr>
				<th class="tools" />
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
						<input
							type="checkbox"
							bind:checked={conf[1].enabled}
						/>
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
	<OrbiterConfigSave {orbiterId} config={configuration} />
{/if}

<style lang="scss">
	@use '../../styles/mixins/media';

	.tools {
		width: 48px;
	}
</style>
