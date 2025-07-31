<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import type { Orbiter, Satellite } from '$declarations/mission_control/mission_control.did';
	import MonitoringSelectedModules from '$lib/components/monitoring/MonitoringSelectedModules.svelte';
	import MonitoringStepReview from '$lib/components/monitoring/MonitoringStepReview.svelte';
	import Warning from '$lib/components/ui/Warning.svelte';
	import { i18n } from '$lib/stores/i18n.store';

	interface Props {
		stopMissionControl: boolean | undefined;
		selectedSatellites: [Principal, Satellite][];
		selectedOrbiters: [Principal, Orbiter][];
		onback: () => void;
		onsubmit: ($event: MouseEvent | TouchEvent) => Promise<void>;
	}

	let { onback, onsubmit, selectedOrbiters, selectedSatellites, stopMissionControl }: Props =
		$props();
</script>

<MonitoringStepReview {onback} {onsubmit}>
	<h2>{$i18n.core.review}</h2>

	<p>{$i18n.monitoring.review_stop_info}</p>

	{#if stopMissionControl === true}
		<Warning>
			{$i18n.monitoring.review_stop_mission_control}
		</Warning>
	{:else if stopMissionControl === false}
		<p>{$i18n.monitoring.review_mission_control_remain_monitored}</p>
	{/if}

	<div class="card-container with-title">
		<span class="title">{$i18n.monitoring.modules}</span>

		<div class="content">
			<MonitoringSelectedModules {selectedOrbiters} {selectedSatellites} />
		</div>
	</div>
</MonitoringStepReview>
