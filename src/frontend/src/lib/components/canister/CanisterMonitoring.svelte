<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { isNullish } from '@dfinity/utils';
	import { compare } from 'semver';
	import { onDestroy, onMount } from 'svelte';
	import { run } from 'svelte/legacy';
	import { fade } from 'svelte/transition';
	import Chart from '$lib/components/charts/Chart.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { MISSION_CONTROL_v0_0_13 } from '$lib/constants/version.constants';
	import { missionControlStore } from '$lib/derived/mission-control.derived';
	import { missionControlVersion } from '$lib/derived/version.derived';
	import {
		initStatusesWorker,
		type MonitoringWorker
	} from '$lib/services/worker.monitoring.services';
	import { i18n } from '$lib/stores/i18n.store';
	import { toasts } from '$lib/stores/toasts.store';
	import type { CanisterSyncMonitoring, Segment } from '$lib/types/canister';
	import type { ChartsData } from '$lib/types/chart';
	import type { PostMessageDataResponse } from '$lib/types/post-message';

	interface Props {
		canisterId: Principal;
		segment: Segment;
	}

	let { canisterId, segment }: Props = $props();

	let chartsData: ChartsData[] = $state([]);

	const syncCanister = ({ canister }: PostMessageDataResponse) => {
		const { data } = canister as CanisterSyncMonitoring;

		if (isNullish(data)) {
			return;
		}

		const { chartsData: d } = data;

		chartsData = d;
	};

	let worker: MonitoringWorker | undefined = $state();

	onMount(async () => (worker = await initStatusesWorker()));
	run(() => {
		// @ts-expect-error TODO: to be migrated to Svelte v5
		worker,
			canisterId,
			$missionControlStore,
			$missionControlVersion,
			(() => {
				// We wait until mission control is loaded
				if (isNullish($missionControlStore)) {
					return;
				}

				// We wait for the version for backwards compatibility because we only want to query the monitoring history for up-to-date mission control
				if (isNullish($missionControlVersion)) {
					return;
				}

				worker?.startMonitoringTimer({
					segments: [
						{
							canisterId: canisterId.toText(),
							segment
						}
					],
					missionControlId: $missionControlStore,
					withMonitoringHistory:
						compare($missionControlVersion.current ?? '0.0.0', MISSION_CONTROL_v0_0_13) > 0,
					callback: syncCanister
				});
			})();
	});

	onDestroy(() => worker?.stopMonitoringTimer());

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

		worker?.restartMonitoringTimer({
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
