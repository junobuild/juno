<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { isNullish } from '@dfinity/utils';
	import { onDestroy, onMount } from 'svelte';
	import { run } from 'svelte/legacy';
	import { fade } from 'svelte/transition';
	import Chart from '$lib/components/charts/Chart.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { initStatusesWorker, type StatusesWorker } from '$lib/services/worker.statuses.services';
	import { i18n } from '$lib/stores/i18n.store';
	import { missionControlStore } from '$lib/stores/mission-control.store';
	import { toasts } from '$lib/stores/toasts.store';
	import type { CanisterJunoStatus, Segment } from '$lib/types/canister';
	import type { ChartsData } from '$lib/types/chart';
	import type { PostMessageDataResponse } from '$lib/types/post-message';

	interface Props {
		canisterId: Principal;
		segment: Segment;
	}

	let { canisterId, segment }: Props = $props();

	let chartsData: ChartsData[] = $state([]);

	const syncCanister = ({ canister }: PostMessageDataResponse) => {
		const { data } = canister as CanisterJunoStatus;

		if (isNullish(data)) {
			return;
		}

		const { chartsData: d } = data;

		chartsData = d;
	};

	let worker: StatusesWorker | undefined = $state();

	onMount(async () => (worker = await initStatusesWorker()));
	run(() => {
		// @ts-expect-error TODO: to be migrated to Svelte v5
		worker,
			// @ts-expect-error TODO: to be migrated to Svelte v5
			canisterId,
			// @ts-expect-error TODO: to be migrated to Svelte v5
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
	});

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

<svelte:window onjunoRestartCycles={restartCycles} />

{#if chartsData.length > 0}
	<div in:fade>
		<Value>
			{#snippet label()}
				{$i18n.observatory.title} <small>(T Cycles)</small>
			{/snippet}

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
