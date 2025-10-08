<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { isEmptyString, isNullish, nonNullish } from '@dfinity/utils';
	import { onMount, type Snippet, untrack } from 'svelte';
	import { fade } from 'svelte/transition';
	import type { MissionControlDid } from '$declarations';
	import Segment from '$lib/components/segments/Segment.svelte';
	import Checkbox from '$lib/components/ui/Checkbox.svelte';
	import SpinnerParagraph from '$lib/components/ui/SpinnerParagraph.svelte';
	import {
		canistersSyncDataUncertifiedCount,
		canistersSyncDataUncertifiedNotSynced
	} from '$lib/derived/canisters.derived';
	import { orbiterWithSyncData } from '$lib/derived/orbiter-merged.derived';
	import { orbiterStore } from '$lib/derived/orbiter.derived';
	import { satellitesWithSyncData } from '$lib/derived/satellites-merged.derived';
	import { sortedSatellites } from '$lib/derived/satellites.derived';
	import { loadOrbiters } from '$lib/services/orbiter/orbiters.services';
	import { loadSatellites } from '$lib/services/satellites.services';
	import { i18n } from '$lib/stores/i18n.store';
	import { toasts } from '$lib/stores/toasts.store';
	import type { MissionControlId } from '$lib/types/mission-control';
	import { orbiterName } from '$lib/utils/orbiter.utils';
	import { satelliteName } from '$lib/utils/satellite.utils';
	import { waitReady } from '$lib/utils/timeout.utils';

	interface Props {
		missionControlId: MissionControlId;
		children?: Snippet;
		selectedMissionControl?: boolean;
		selectedSatellites: [Principal, MissionControlDid.Satellite][];
		selectedOrbiters: [Principal, MissionControlDid.Orbiter][];
		selectedDisabled: boolean;
		withMissionControl?: boolean;
		reloadSegments?: boolean;
		loadingSegments?: 'loading' | 'ready' | 'error';
		onlySyncedSegments?: boolean;
	}

	let {
		missionControlId,
		children,
		selectedMissionControl = $bindable(false),
		selectedSatellites = $bindable([]),
		selectedOrbiters = $bindable([]),
		selectedDisabled = $bindable(false),
		withMissionControl = $bindable(true),
		reloadSegments = true,
		loadingSegments = $bindable('loading'),
		onlySyncedSegments = true
	}: Props = $props();

	let loadingState = $state<'loading' | 'ready' | 'error'>('loading');

	$effect(() => {
		loadingSegments = loadingState;
	});

	let satellites = $state<[Principal, MissionControlDid.Satellite][]>([]);
	let orbiters = $state<[Principal, MissionControlDid.Orbiter][]>([]);

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

			loadingState = 'error';
			return;
		}

		const countModules = $sortedSatellites.length + (isNullish($orbiterStore) ? 0 : 1);

		if (countModules === 0) {
			satellites = [];
			orbiters = [];

			loadingState = 'ready';
			return;
		}

		const result = await waitReady({
			isDisabled: () =>
				$canistersSyncDataUncertifiedNotSynced ||
				$canistersSyncDataUncertifiedCount < countModules + 1
		});

		if (result === 'timeout') {
			satellites = [];
			orbiters = [];

			loadingState = 'error';

			toasts.error({
				text: $i18n.errors.canister_status
			});

			return;
		}

		loadingState = 'ready';

		satellites = $satellitesWithSyncData
			.filter(
				({ canister: { data } }) => data?.canister?.status === 'running' || !onlySyncedSegments
			)
			.map(({ segment: { satellite_id, ...rest } }) => [satellite_id, { satellite_id, ...rest }]);

		orbiters = (nonNullish($orbiterWithSyncData) ? [$orbiterWithSyncData] : [])
			.filter(
				({ canister: { data } }) => data?.canister?.status === 'running' || !onlySyncedSegments
			)
			.map(({ segment: { orbiter_id, ...rest } }) => [orbiter_id, { orbiter_id, ...rest }]);

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
			{#if loadingState !== 'loading'}
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

				{#each satellites as satellite (satellite[0].toText())}
					{@const satelliteId = satellite[0].toText()}
					<tr>
						<td class="actions"
							><Checkbox
								><input
									id={satelliteId}
									type="checkbox"
									value={satellite}
									bind:group={selectedSatellites}
								/></Checkbox
							></td
						>
						<td>
							<label for={satelliteId}>
								<Segment id={satellite[0]}>
									{satelliteName(satellite[1])}
								</Segment>
							</label></td
						>
					</tr>
				{/each}

				{#each orbiters as orbiter (orbiter[0].toText())}
					{@const orbName = orbiterName(orbiter[1])}

					<tr>
						<td class="actions"
							><Checkbox
								><input type="checkbox" value={orbiter} bind:group={selectedOrbiters} /></Checkbox
							></td
						>
						<td>
							<Segment id={orbiter[0]}>
								{isEmptyString(orbName) ? $i18n.analytics.title : orbName}
							</Segment>
						</td>
					</tr>
				{/each}
			{:else}
				<tr
					><td class="loading" colspan="2"
						><SpinnerParagraph>{$i18n.canisters.loading_segments}</SpinnerParagraph></td
					>
				</tr>
			{/if}
		</tbody>
	</table>
</div>

{#if loadingState === 'ready'}
	<div class="objects" in:fade>
		<div class="all">
			<Checkbox>
				<input checked={allSelected} onchange={toggleAll} type="checkbox" />
				<span>{allSelected ? $i18n.core.unselect_all : $i18n.core.select_all}</span>
			</Checkbox>
		</div>
	</div>
{/if}

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

	.loading {
		--spinner-paragraph-margin: 0;
	}
</style>
