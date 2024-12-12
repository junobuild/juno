<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import type { Orbiter, Satellite } from '$declarations/mission_control/mission_control.did';
	import SegmentsTable from '$lib/components/core/SegmentsTable.svelte';
	import MonitoringCreateStrategy from '$lib/components/monitoring/MonitoringCreateStrategy.svelte';
	import MonitoringCreateStrategySelectSegments from '$lib/components/monitoring/MonitoringCreateStrategySelectSegments.svelte';
	import Html from '$lib/components/ui/Html.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import SpinnerModal from '$lib/components/ui/SpinnerModal.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { isBusy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';
	import type {
		JunoModalDetail,
		JunoModalMonitoringCreateBulkStrategyDetail
	} from '$lib/types/modal';
	import { i18nFormat } from '$lib/utils/i18n.utils';

	interface Props {
		detail: JunoModalDetail;
		onclose: () => void;
	}

	let { detail, onclose }: Props = $props();

	let { settings, missionControlId } = $derived(
		detail as JunoModalMonitoringCreateBulkStrategyDetail
	);

	let steps: 'init' | 'strategy' | 'review' | 'in_progress' | 'ready' = $state('init');

	let selectedMissionControl = $state(false);
	let selectedSatellites: [Principal, Satellite][] = $state([]);
	let selectedOrbiters: [Principal, Orbiter][] = $state([]);

	let minCycles: bigint = $state(0n);
	let fundCycles: bigint = $state(0n);

	const handleSubmit = async ($event: SubmitEvent) => {};
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

	{:else if steps === 'strategy'}
		<MonitoringCreateStrategy
			bind:minCycles
			bind:fundCycles
			oncontinue={() => (steps = 'review')}
		/>
	{:else}
		<MonitoringCreateStrategySelectSegments
			{missionControlId}
			bind:selectedMissionControl
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
