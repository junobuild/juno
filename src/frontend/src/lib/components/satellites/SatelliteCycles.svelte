<script lang="ts">
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import { fade } from 'svelte/transition';
	import { listSatelliteStatuses } from '$lib/api/mission-control.api';
	import { missionControlStore } from '$lib/stores/mission-control.store';
	import type { Principal } from '@dfinity/principal';
	import { authStore } from '$lib/stores/auth.store';
	import { fromNullable, isNullish } from '@dfinity/utils';
	import { fromBigIntNanoSeconds } from '$lib/utils/date.utils';
	import { formatTCycles } from '$lib/utils/cycles.utils';
	import { startOfDay } from 'date-fns';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { ChartsData } from '$lib/types/chart';
	import Chart from '$lib/components/charts/Chart.svelte';

	export let satellite: Satellite;

	let chartsStatuses: ChartsData[] = [];

	const load = async ({ missionControlId }: { missionControlId: Principal | undefined | null }) => {
		if (isNullish(missionControlId)) {
			return;
		}

		const results = await listSatelliteStatuses({
			identity: $authStore.identity,
			missionControlId,
			satelliteId: satellite.satellite_id
		});

		chartsStatuses = (fromNullable(results) ?? [])
			.map(([timestamp, result]) => {
				if ('Err' in result) {
					return {
						x: `${fromBigIntNanoSeconds(timestamp).getTime()}`,
						y: 0
					};
				}

				const {
					Ok: {
						status: { cycles }
					}
				} = result;

				return {
					x: `${fromBigIntNanoSeconds(timestamp).getTime()}`,
					y: parseFloat(formatTCycles(cycles))
				};
			})
			.sort(({ x: aKey }, { x: bKey }) => parseInt(aKey) - parseInt(bKey));
	};

	$: $missionControlStore, (async () => load({ missionControlId: $missionControlStore }))();

	let totalStatusesPerDay: Record<string, number[]>;
	$: totalStatusesPerDay = chartsStatuses.reduce(
		(acc, { x, y }) => {
			const date = new Date(parseInt(x));
			const key = startOfDay(date).getTime();

			return {
				...acc,
				[key]: [...(acc[key] ?? []), y]
			};
		},
		{} as Record<string, number[]>
	);

	let chartsData: ChartsData[];
	$: chartsData = Object.entries(totalStatusesPerDay).map(([key, values]) => ({
		x: key,
		y: values.reduce((acc, value) => acc + value, 0) / values.length
	}));
</script>

{#if chartsData.length > 0}
	<div class="container" in:fade>
		<Value>
			<svelte:fragment slot="label"
				>{$i18n.observatory.title} <small>(T Cycles)</small></svelte:fragment
			>

			<div class="chart-container">
				<Chart {chartsData} />
			</div>
		</Value>
	</div>
{/if}

<style lang="scss">
	@use '../../styles/mixins/shadow';

	.container {
		grid-column: 2 / 4;
	}

	.chart-container {
		width: 100%;
		height: 258px;
		fill: var(--value-color);

		margin: 0 0 var(--padding-4x);
	}
</style>
