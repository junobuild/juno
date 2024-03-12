<script lang="ts">
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import { fade } from 'svelte/transition';
	import { listSatelliteStatuses } from '$lib/api/mission-control.api';
	import { missionControlStore } from '$lib/stores/mission-control.store';
	import type { Principal } from '@dfinity/principal';
	import { authStore } from '$lib/stores/auth.store';
	import { fromNullable, isNullish } from '@dfinity/utils';
	import { formatToDateNumeric, formatToDay, fromBigIntNanoSeconds } from '$lib/utils/date.utils';
	import { formatTCycles } from '$lib/utils/cycles.utils';
	import AxisY from '$lib/components/charts/AxisY.svelte';
	import AxisX from '$lib/components/charts/AxisX.svelte';
	import Area from '$lib/components/charts/Area.svelte';
	import Line from '$lib/components/charts/Line.svelte';
	import { LayerCake, Svg } from 'layercake';
	import { last } from '$lib/utils/utils';
	import { eachDayOfInterval, startOfDay } from 'date-fns';
	import Value from '$lib/components/ui/Value.svelte';
	import IconTelescope from '$lib/components/icons/IconTelescope.svelte';
	import { i18n } from '$lib/stores/i18n.store';

	export let satellite: Satellite;

	const xKey = 'myX';
	const yKey = 'myY';

	type ChartsData = {
		[xKey]: string;
		[yKey]: number;
	};

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
			})
			.sort(({ [xKey]: aKey }, { [xKey]: bKey }) => parseInt(aKey) - parseInt(bKey));
	};

	$: $missionControlStore, (async () => load({ missionControlId: $missionControlStore }))();

	let totalStatusesPerDay: Record<string, number[]>;
	$: totalStatusesPerDay = chartsStatuses.reduce(
		(acc, value) => {
			const date = new Date(parseInt(value[xKey]));
			const key = startOfDay(date).getTime();

			return {
				...acc,
				[key]: [...(acc[key] ?? []), value[yKey]]
			};
		},
		{} as Record<string, number[]>
	);

	let chartsData: ChartsData[];
	$: chartsData = Object.entries(totalStatusesPerDay).map(([key, values]) => ({
		[xKey]: key,
		[yKey]: values.reduce((acc, value) => acc + value, 0) / values.length
	}));

	let ticks: string[];
	$: ticks = Object.values(chartsData).map(({ [xKey]: a }) => a);

	const formatTick = (d: string): string => {
		const date = new Date(parseInt(d));
		const time = date.getDate();

		return chartsData.length <= 31 && time % 2 != 0
			? formatToDay(date)
			: time % 5 === 0
				? formatToDay(date)
				: '';
	};
</script>

{#if chartsData.length > 0}
	<div class="container" in:fade>
		<Value>
			<svelte:fragment slot="label"
				>{$i18n.observatory.title} <small>(T Cycles)</small></svelte:fragment
			>

			<div class="chart-container">
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
		height: 300px;
		fill: var(--value-color);

		margin: 0 0 var(--padding-4x);
	}
</style>
