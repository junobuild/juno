<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store';
	import type { Principal } from '@dfinity/principal';
	import OriginConfigAdd from '$lib/components/analytics/OriginConfigAdd.svelte';
	import { toasts } from '$lib/stores/toasts.store';
	import { onMount } from 'svelte';
	import { listOriginConfigs } from '$lib/api/orbiter.api';
	import type { OriginConfig } from '$declarations/orbiter/orbiter.did';
	import { nonNullish } from '$lib/utils/utils';
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import { satellitesStore } from '$lib/stores/satellite.store';
	import OriginConfigDelete from '$lib/components/analytics/OriginConfigDelete.svelte';
	import type { SatelliteIdText } from '$lib/types/satellite';
	import { satelliteName } from '$lib/utils/satellite.utils';

	export let orbiterId: Principal;

	let origins: [Principal, OriginConfig][] | undefined;

	const list = (): Promise<[Principal, OriginConfig][]> => listOriginConfigs({ orbiterId });

	const load = async () => {
		try {
			origins = await list();
		} catch (err: unknown) {
			toasts.error({
				text: $i18n.errors.origins_listing,
				detail: err
			});
		}
	};

	onMount(async () => await load());

	let empty: boolean | undefined = undefined;
	$: empty = nonNullish(origins) && origins.length === 0;

	let satellites: Satellite[] = [];
	$: satellites = ($satellitesStore ?? []).filter(
		({ satellite_id }) =>
			(origins ?? []).find(
				([origin_satellite_id, _]) => origin_satellite_id.toText() === satellite_id.toText()
			) === undefined
	);

	let satelliteNames: Record<SatelliteIdText, string> = {};
	$: satelliteNames = ($satellitesStore ?? []).reduce(
		(acc, satellite) => ({
			...acc,
			[satellite.satellite_id.toText()]: satelliteName(satellite)
		}),
		{}
	);
</script>

<div class="table-container">
	<table>
		<thead>
			<tr>
				<th class="tools" />
				<th class="origin"> {$i18n.satellites.satellite} </th>
				<th class="origin"> {$i18n.origins.filter} </th>
			</tr>
		</thead>
		<tbody>
			{#each origins ?? [] as [satelliteId, config] (satelliteId.toText())}
				{@const satelliteName = satelliteNames[satelliteId.toText()] ?? ''}

				<tr>
					<td class="actions">
						<OriginConfigDelete {orbiterId} {satelliteId} {config} {satelliteName} on:junoReload={load} />
					</td>

					<td>
						{satelliteName}
					</td>

					<td>{config.filter}</td>
				</tr>
			{/each}

			{#if empty}
				<tr>
					<td class="actions" />
					<td colspan="2">
						{$i18n.origins.empty}
					</td>
				</tr>
			{/if}
		</tbody>
	</table>
</div>

{#if satellites.length > 0}
	<OriginConfigAdd {orbiterId} {satellites} on:junoReload={load} />
{/if}

<style lang="scss">
	@use '../../styles/mixins/media';

	.tools {
		width: 48px;
	}
</style>
