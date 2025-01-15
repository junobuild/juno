<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { isEmptyString, nonNullish } from '@dfinity/utils';
	import { onMount, type Snippet, untrack } from 'svelte';
	import type { Orbiter, Satellite } from '$declarations/mission_control/mission_control.did';
	import Segment from '$lib/components/segments/Segment.svelte';
	import Checkbox from '$lib/components/ui/Checkbox.svelte';
	import { orbiterStore } from '$lib/derived/orbiter.derived';
	import { satellitesStore } from '$lib/derived/satellite.derived';
	import { loadOrbiters } from '$lib/services/orbiters.services';
	import { loadSatellites } from '$lib/services/satellites.services';
	import { i18n } from '$lib/stores/i18n.store';
	import { orbiterName } from '$lib/utils/orbiter.utils';
	import { satelliteName } from '$lib/utils/satellite.utils';

	interface Props {
		missionControlId: Principal;
		children?: Snippet;
		selectedMissionControl?: boolean;
		selectedSatellites: [Principal, Satellite][];
		selectedOrbiters: [Principal, Orbiter][];
		selectedDisabled: boolean;
		withMissionControl?: boolean;
		reloadSegments?: boolean;
	}

	let {
		missionControlId,
		children,
		selectedMissionControl = $bindable(false),
		selectedSatellites = $bindable([]),
		selectedOrbiters = $bindable([]),
		selectedDisabled = $bindable(false),
		withMissionControl = $bindable(true),
		reloadSegments = true
	}: Props = $props();

	let satellites: [Principal, Satellite][] = $state([]);
	let orbiters: [Principal, Orbiter][] = $state([]);

	const loadSegments = async () => {
		const [{ result: resultSatellites }, { result: resultOrbiters }] = await Promise.all([
			loadSatellites({ missionControlId, reload: reloadSegments }),
			loadOrbiters({ missionControlId, reload: reloadSegments })
		]);

		if (
			!['success', 'skip'].includes(resultSatellites) ||
			!['success', 'skip'].includes(resultOrbiters)
		) {
			satellites = [];
			orbiters = [];
			return;
		}

		satellites = ($satellitesStore ?? []).map(({ satellite_id, ...rest }) => [
			satellite_id,
			{ satellite_id, ...rest }
		]);
		orbiters = nonNullish($orbiterStore) ? [[$orbiterStore.orbiter_id, $orbiterStore]] : [];

		toggleAll();
	};

	onMount(() => {
		loadSegments();
	});

	let allSelected = $state(false);

	const toggleAll = () => {
		allSelected = !allSelected;

		selectedMissionControl = allSelected;
		selectedSatellites = allSelected ? [...satellites] : [];
		selectedOrbiters = allSelected ? [...orbiters] : [];
	};

	$effect(() => {
		const disabled =
			selectedSatellites.length === 0 && !selectedMissionControl && selectedOrbiters.length === 0;

		untrack(() => {
			selectedDisabled = disabled;
		});
	});
</script>

<div class="table-container">
	{@render children?.()}

	<table>
		<thead>
			<tr>
				<th class="tools"> {$i18n.cli.selected} </th>
				<th> {$i18n.cli.module} </th>
			</tr>
		</thead>
		<tbody>
			{#if withMissionControl}
				<tr>
					<td class="actions">
						<Checkbox>
							<input type="checkbox" bind:checked={selectedMissionControl} />
						</Checkbox>
					</td>

					<td>
						<Segment id={missionControlId}>
							{$i18n.mission_control.title}
						</Segment>
					</td>
				</tr>
			{/if}

			{#each satellites as satellite}
				<tr>
					<td class="actions"
						><Checkbox
							><input type="checkbox" bind:group={selectedSatellites} value={satellite} /></Checkbox
						></td
					>
					<td>
						<Segment id={satellite[0]}>
							{satelliteName(satellite[1])}
						</Segment></td
					>
				</tr>
			{/each}

			{#each orbiters as orbiter}
				{@const orbName = orbiterName(orbiter[1])}

				<tr>
					<td class="actions"
						><Checkbox
							><input type="checkbox" bind:group={selectedOrbiters} value={orbiter} /></Checkbox
						></td
					>
					<td>
						<Segment id={orbiter[0]}>
							{isEmptyString(orbName) ? $i18n.analytics.title : orbName}
						</Segment>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<div class="objects">
	<div class="all">
		<Checkbox>
			<input type="checkbox" onchange={toggleAll} checked={allSelected} />
			<span>{allSelected ? $i18n.core.unselect_all : $i18n.core.select_all}</span>
		</Checkbox>
	</div>
</div>

<style lang="scss">
	@use '../../styles/mixins/text';

	.tools {
		width: 88px;
	}

	span {
		@include text.truncate;
	}

	.all {
		display: flex;
		align-items: flex-start;

		font-size: var(--font-size-ultra-small);

		margin: var(--padding) 0 0;
	}

	.objects {
		margin: 0 0 var(--padding-4x);
		padding: var(--padding) var(--padding-2x);
	}

	.table-container {
		margin: 0;
	}

	.actions {
		display: flex;
		padding: var(--padding-1_5x) var(--padding-2x);
	}
</style>
