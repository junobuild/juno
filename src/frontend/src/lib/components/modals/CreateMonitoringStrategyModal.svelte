<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { fromNullable } from '@dfinity/utils';
	import type {
		CyclesMonitoringStrategy,
		Orbiter,
		Satellite
	} from '$declarations/mission_control/mission_control.did';
	import MonitoringCreateStrategy from '$lib/components/monitoring/MonitoringCreateStrategy.svelte';
	import MonitoringCreateStrategyMissionControl from '$lib/components/monitoring/MonitoringCreateStrategyMissionControl.svelte';
	import MonitoringCreateStrategyReview from '$lib/components/monitoring/MonitoringCreateStrategyReview.svelte';
	import MonitoringCreateStrategySelectSegments from '$lib/components/monitoring/MonitoringCreateStrategySelectSegments.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import SpinnerModal from '$lib/components/ui/SpinnerModal.svelte';
	import { applyMonitoringCyclesStrategy } from '$lib/services/monitoring.services';
	import { authStore } from '$lib/stores/auth.store';
	import { wizardBusy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';
	import type {
		JunoModalDetail,
		JunoModalMonitoringCreateBulkStrategyDetail
	} from '$lib/types/modal';
	import { emit } from '$lib/utils/events.utils';

	interface Props {
		detail: JunoModalDetail;
		onclose: () => void;
	}

	let { detail, onclose }: Props = $props();

	let { settings, missionControlId } = $derived(
		detail as JunoModalMonitoringCreateBulkStrategyDetail
	);

	let steps:
		| 'init'
		| 'strategy'
		| 'mission_control'
		| 'mission_control_strategy'
		| 'review'
		| 'in_progress'
		| 'ready' = $state('init');

	let selectedSatellites: [Principal, Satellite][] = $state([]);
	let selectedOrbiters: [Principal, Orbiter][] = $state([]);

	let minCycles: bigint | undefined = $state(undefined);
	let fundCycles: bigint | undefined = $state(undefined);

	let missionControlMinCycles: bigint | undefined = $state(undefined);
	let missionControlFundCycles: bigint | undefined = $state(undefined);

	let missionControlCycles = $derived(
		fromNullable(fromNullable(settings?.monitoring ?? [])?.cycles ?? [])
	);

	let missionControl: { monitored: boolean; strategy: CyclesMonitoringStrategy | undefined } =
		$derived({
			monitored: missionControlCycles?.enabled === true,
			strategy: fromNullable(missionControlCycles?.strategy ?? [])
		});

	const onsubmit = async ($event: MouseEvent | TouchEvent) => {
		$event.preventDefault();

		wizardBusy.start();
		steps = 'in_progress';

		const { success } = await applyMonitoringCyclesStrategy({
			identity: $authStore.identity,
			missionControlId,
			satellites: selectedSatellites.map(([id, _]) => id),
			orbiters: selectedOrbiters.map(([id, _]) => id),
			fundCycles,
			minCycles,
			missionControlMonitored: missionControl.monitored,
			missionControlMinCycles,
			missionControlFundCycles
		});

		wizardBusy.stop();

		if (success !== 'ok') {
			steps = 'init';
			return;
		}

		steps = 'ready';
	};
</script>

<Modal on:junoClose={onclose}>
	{#if steps === 'ready'}
		<div class="msg">
			<p>
				{$i18n.monitoring.strategy_created}
			</p>
			<button onclick={onclose}>{$i18n.core.close}</button>
		</div>
	{:else if steps === 'in_progress'}
		<SpinnerModal>
			<p>{$i18n.monitoring.applying_strategy}</p>
		</SpinnerModal>
	{:else if steps === 'review'}
		<MonitoringCreateStrategyReview
			{selectedSatellites}
			{selectedOrbiters}
			{minCycles}
			{fundCycles}
			{missionControlMinCycles}
			{missionControlFundCycles}
			{missionControl}
			onback={() => (steps = 'mission_control')}
			{onsubmit}
		/>
	{:else if steps === 'mission_control_strategy'}
		<MonitoringCreateStrategy
			bind:minCycles={missionControlMinCycles}
			bind:fundCycles={missionControlFundCycles}
			strategy="mission-control"
			onback={() => (steps = 'mission_control')}
			oncontinue={() => (steps = 'review')}
		/>
	{:else if steps === 'mission_control'}
		<MonitoringCreateStrategyMissionControl
			{missionControl}
			onno={() => (steps = 'mission_control_strategy')}
			onyes={() => (steps = 'review')}
		/>
	{:else if steps === 'strategy'}
		<MonitoringCreateStrategy
			bind:minCycles
			bind:fundCycles
			strategy="modules"
			onback={() => (steps = 'init')}
			oncontinue={() => (steps = 'mission_control')}
		/>
	{:else}
		<MonitoringCreateStrategySelectSegments
			{missionControlId}
			bind:selectedSatellites
			bind:selectedOrbiters
			oncontinue={() => (steps = 'strategy')}
		/>
	{/if}
</Modal>

<style lang="scss">
	@use '../../styles/mixins/overlay';

	.msg {
		@include overlay.message;
	}
</style>
