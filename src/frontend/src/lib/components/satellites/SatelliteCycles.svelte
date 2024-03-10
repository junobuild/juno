<script lang="ts">
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
    import { fade } from 'svelte/transition';
	import { listSatelliteStatuses } from '$lib/api/mission-control.api';
	import { missionControlStore } from '$lib/stores/mission-control.store';
	import type { Principal } from '@dfinity/principal';
	import { authStore } from '$lib/stores/auth.store';
	import { fromNullable, isNullish } from '@dfinity/utils';
	import { formatToDay, fromBigIntNanoSeconds } from '$lib/utils/date.utils';
	import { formatTCycles } from '$lib/utils/cycles.utils';
	import AxisY from '$lib/components/charts/AxisY.svelte';
	import AxisX from '$lib/components/charts/AxisX.svelte';
	import Area from '$lib/components/charts/Area.svelte';
	import Line from '$lib/components/charts/Line.svelte';
	import { LayerCake, Svg } from 'layercake';

	export let satellite: Satellite;

	let dailyTotalArray: [string, number][];

	const xKey = 'myX';
	const yKey = 'myY';

	type ChartsData = {
		[xKey]: string;
		[yKey]: number;
	};

	let chartsData: ChartsData[] = [];

	const load = async ({ missionControlId }: { missionControlId: Principal | undefined | null }) => {
		if (isNullish(missionControlId)) {
			return;
		}

		const results = await listSatelliteStatuses({
			identity: $authStore.identity,
			missionControlId,
			satelliteId: satellite.satellite_id
		});

		chartsData = (fromNullable(results) ?? []).map(([timestamp, result]) => {
			if ('Err' in result) {
				return {
					[xKey]: `${fromBigIntNanoSeconds(timestamp).getTime()}`,
					[yKey]: 0
				};
			}

			const {
				Ok: {
					status: { cycles }
				}
			} = result;

			return {
				[xKey]: `${fromBigIntNanoSeconds(timestamp).getTime()}`,
				[yKey]: parseFloat(formatTCycles(cycles))
			};
		});
	};

	$: $missionControlStore, (async () => load({ missionControlId: $missionControlStore }))();

	let ticks: string[];
	$: ticks = Object.values(chartsData).map(({ [xKey]: a }) => a);

	const formatTick = (d: string): string => {
		const date = new Date(parseInt(d));
		return formatToDay(date);
	};
</script>

Cycles

{#if chartsData.length > 0}
    <div class="chart-container" in:fade>
	<LayerCake
		padding={{ top: 32, right: 16, bottom: 32, left: 16 }}
		x={xKey}
		y={yKey}
		yNice={4}
		yDomain={[0, null]}
		data={chartsData}
	>
		<Svg>
			<AxisX {formatTick} {ticks} />
			<AxisY ticks={4} />
			<Line />
			<Area />
		</Svg>
	</LayerCake>
    </div>
{/if}


<style lang="scss">
  @use '../../styles/mixins/shadow';

  .chart-container {
    width: 100%;
    height: 300px;
    fill: var(--value-color);

    margin: 0 0 var(--padding-4x);
    padding: var(--padding-2x) var(--padding-6x);

    @include shadow.strong-card;
  }
</style>
