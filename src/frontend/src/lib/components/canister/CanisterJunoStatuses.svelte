<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import type { CanisterJunoStatus, Segment } from '$lib/types/canister';
	import type { PostMessageDataResponse } from '$lib/types/post-message';
	import { onDestroy, onMount } from 'svelte';
	import { initStatusesWorker, type StatusesWorker } from '$lib/services/worker.statuses.services';
	import { isNullish } from '@dfinity/utils';
	import { missionControlStore } from '$lib/stores/mission-control.store';
	import { toasts } from '$lib/stores/toasts.store';
	import { i18n } from '$lib/stores/i18n.store';
	import type { ChartsData } from '$lib/types/chart';
	import Value from '$lib/components/ui/Value.svelte';
	import Chart from '$lib/components/charts/Chart.svelte';
	import { fade } from 'svelte/transition';

	export let canisterId: Principal;
	export let segment: Segment;

	let chartsData: ChartsData[] = [];

	const syncCanister = ({ canister }: PostMessageDataResponse) => {
		const { data } = canister as CanisterJunoStatus;

		if (isNullish(data)) {
			return;
		}

		const { chartsData: d } = data;

		chartsData = d;
	};

	let worker: StatusesWorker | undefined;

	onMount(async () => (worker = await initStatusesWorker()));
	$: worker,
		canisterId,
		$missionControlStore,
		(() => {
			// We wait until mission control is loaded
			if (isNullish($missionControlStore)) {
				return;
			}

			worker?.startStatusesTimer({
				segments: [
					{
						canisterId: canisterId.toText(),
						segment
					}
				],
				missionControlId: $missionControlStore,
				callback: syncCanister
			});
		})();

	onDestroy(() => worker?.stopStatusesTimer());

	const restartCycles = ({
		detail: { canisterId: syncCanisterId }
	}: CustomEvent<{ canisterId: Principal }>) => {
		if (syncCanisterId.toText() !== canisterId.toText()) {
			return;
		}

		if (isNullish($missionControlStore)) {
			toasts.error({
				text: $i18n.errors.no_mission_control
			});
			return;
		}

		worker?.restartStatusesTimer({
			segments: [
				{
					canisterId: canisterId.toText(),
					segment
				}
			],
			missionControlId: $missionControlStore
		});
	};
</script>

<svelte:window on:junoRestartCycles={restartCycles} />

{#if chartsData.length > 0}
	<div in:fade>
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

	.chart-container {
		width: 100%;
		height: 258px;
		fill: var(--value-color);

		margin: 0 0 var(--padding-4x);
	}
</style>
