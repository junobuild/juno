<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { fromNullable } from '@dfinity/utils';
	import type {
		CyclesMonitoringStrategy,
		Orbiter,
		Satellite
	} from '$declarations/mission_control/mission_control.did';
	import MonitoringSelectSegments from '$lib/components/monitoring/MonitoringSelectSegments.svelte';
	import MonitoringStopMissionControl from '$lib/components/monitoring/MonitoringStopMissionControl.svelte';
	import MonitoringStopReview from '$lib/components/monitoring/MonitoringStopReview.svelte';
	import ProgressMonitoring from '$lib/components/monitoring/ProgressMonitoring.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import { satellitesStore } from '$lib/derived/satellite.derived';
	import { i18n } from '$lib/stores/i18n.store';
	import type { JunoModalDetail, JunoModalMonitoringStrategyDetail } from '$lib/types/modal';
	import type { MonitoringStrategyProgress } from '$lib/types/strategy';

	interface Props {
		detail: JunoModalDetail;
		onclose: () => void;
	}

	let { detail, onclose }: Props = $props();

	let { settings, missionControlId } = $derived(detail as JunoModalMonitoringStrategyDetail);

	let selectedSatellites: [Principal, Satellite][] = $state([]);
	let selectedOrbiters: [Principal, Orbiter][] = $state([]);

	let missionControlCycles = $derived(
		fromNullable(fromNullable(settings?.monitoring ?? [])?.cycles ?? [])
	);

	let missionControl: { monitored: boolean; strategy: CyclesMonitoringStrategy | undefined } =
		$derived({
			monitored: missionControlCycles?.enabled === true,
			strategy: fromNullable(missionControlCycles?.strategy ?? [])
		});

	let stopMissionControl: boolean | undefined = $state(undefined);

	let steps: 'init' | 'mission_control' | 'in_progress' | 'review' | 'ready' = $state('init');

	let progress: MonitoringStrategyProgress | undefined = $state(undefined);
	const onProgress = (stopProgress: MonitoringStrategyProgress | undefined) =>
		(progress = stopProgress);

	const onsubmit = async ($event: MouseEvent | TouchEvent) => {
		$event.preventDefault();
	};

	const onContinueSegments = () => {
		if (!missionControl.monitored) {
			steps = 'review';
			return;
		}

		steps = 'mission_control';
	};
</script>

<Modal on:junoClose={onclose}>
	{#if steps === 'ready'}
		<div class="msg">
			<p>
				{$i18n.monitoring.monitoring_stopped}
			</p>
			<button onclick={onclose}>{$i18n.core.close}</button>
		</div>
	{:else if steps === 'in_progress'}
		<ProgressMonitoring {progress} action="stop" />
	{:else if steps === 'mission_control'}
		<MonitoringStopMissionControl
			onno={() => {
				stopMissionControl = false;
				steps = 'review';
			}}
			onyes={() => {
				stopMissionControl = true;
				steps = 'review';
			}}
		/>
	{:else if steps === 'review'}
		<MonitoringStopReview
			{selectedSatellites}
			{selectedOrbiters}
			{stopMissionControl}
			onback={() => (steps = 'mission_control')}
			{onsubmit}
		/>
	{:else}
		<MonitoringSelectSegments
			{missionControlId}
			bind:selectedSatellites
			bind:selectedOrbiters
			oncontinue={onContinueSegments}
		>
			<h2>{$i18n.monitoring.stop_monitoring}</h2>

			<p>{$i18n.monitoring.stop_info}</p>
		</MonitoringSelectSegments>
	{/if}
</Modal>
