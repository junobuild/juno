<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { fromNullable, isNullish, nonNullish, notEmptyString } from '@dfinity/utils';
	import { onMount } from 'svelte';
	import type {
		CyclesMonitoringStrategy,
		Orbiter,
		Satellite
	} from '$declarations/mission_control/mission_control.did';
	import MonitoringCreateStrategy from '$lib/components/monitoring/MonitoringCreateStrategy.svelte';
	import MonitoringCreateStrategyMissionControl from '$lib/components/monitoring/MonitoringCreateStrategyMissionControl.svelte';
	import MonitoringCreateStrategyNotifications from '$lib/components/monitoring/MonitoringCreateStrategyNotifications.svelte';
	import MonitoringCreateStrategyReview from '$lib/components/monitoring/MonitoringCreateStrategyReview.svelte';
	import MonitoringCreateStrategyWithDefault from '$lib/components/monitoring/MonitoringCreateStrategyWithDefault.svelte';
	import MonitoringSelectSegments from '$lib/components/monitoring/MonitoringSelectSegments.svelte';
	import ProgressMonitoring from '$lib/components/monitoring/ProgressMonitoring.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import {
		applyMonitoringCyclesStrategy,
		type ApplyMonitoringCyclesStrategyOptions
	} from '$lib/services/monitoring.services';
	import { authStore } from '$lib/stores/auth.store';
	import { wizardBusy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';
	import type { JunoModalDetail, JunoModalMonitoringStrategyDetail } from '$lib/types/modal';
	import type { MonitoringStrategyProgress } from '$lib/types/strategy';
	import type { Option } from '$lib/types/utils';
	import { metadataEmail } from '$lib/utils/metadata.utils';

	interface Props {
		detail: JunoModalDetail;
		onclose: () => void;
	}

	let { detail, onclose }: Props = $props();

	let { settings, userMetadata, missionControlId } = $derived(
		detail as JunoModalMonitoringStrategyDetail
	);

	let step:
		| 'init'
		| 'strategy'
		| 'mission_control'
		| 'mission_control_strategy'
		| 'review'
		| 'in_progress'
		| 'notifications'
		| 'ready' = $state('init');

	// Monitoring strategy

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

	// Monitoring email

	let missionControlEmail = $derived(metadataEmail(userMetadata));
	let hasMissionControlEmail = $derived(nonNullish(missionControlEmail));
	let userEmail: Option<string> = $state(undefined);

	// Monitoring default strategy

	let defaultStrategy = $derived(
		fromNullable(
			fromNullable(fromNullable(settings?.monitoring_config ?? [])?.cycles ?? [])
				?.default_strategy ?? []
		)
	);

	let useAsDefaultStrategy = $state(true);

	// Monitoring configuration
	let withOptions: ApplyMonitoringCyclesStrategyOptions | undefined = $derived(
		useAsDefaultStrategy || (nonNullish(userEmail) && notEmptyString(userEmail))
			? {
					useAsDefaultStrategy,
					userEmail,
					userMetadata
				}
			: undefined
	);

	onMount(() => {
		useAsDefaultStrategy = isNullish(defaultStrategy);
	});

	// Submit

	let progress: MonitoringStrategyProgress | undefined = $state(undefined);
	const onProgress = (applyProgress: MonitoringStrategyProgress | undefined) =>
		(progress = applyProgress);

	const onsubmit = async ($event: MouseEvent | TouchEvent) => {
		$event.preventDefault();

		onProgress(undefined);

		wizardBusy.start();
		step = 'in_progress';

		const { success } = await applyMonitoringCyclesStrategy({
			identity: $authStore.identity,
			missionControlId,
			satellites: selectedSatellites.map(([id, _]) => id),
			orbiters: selectedOrbiters.map(([id, _]) => id),
			fundCycles,
			minCycles,
			missionControlMonitored: missionControl.monitored,
			missionControlMinCycles,
			missionControlFundCycles,
			options: withOptions,
			onProgress
		});

		wizardBusy.stop();

		if (success !== 'ok') {
			step = 'init';
			return;
		}

		setTimeout(() => (step = 'ready'), 500);
	};

	const gotoReviewOrNotifications = () =>
		(step = hasMissionControlEmail ? 'review' : 'notifications');
</script>

<Modal on:junoClose={onclose}>
	{#if step === 'ready'}
		<div class="msg">
			<p>
				{$i18n.monitoring.strategy_created}
			</p>
			<button onclick={onclose}>{$i18n.core.close}</button>
		</div>
	{:else if step === 'in_progress'}
		<ProgressMonitoring {progress} action="create" withOptions={nonNullish(withOptions)} />
	{:else if step === 'notifications'}
		<MonitoringCreateStrategyNotifications
			onback={() => (step = 'mission_control')}
			oncontinue={(email) => {
				userEmail = email;
				step = 'review';
			}}
		/>
	{:else if step === 'review'}
		<MonitoringCreateStrategyReview
			{selectedSatellites}
			{selectedOrbiters}
			{minCycles}
			{fundCycles}
			{useAsDefaultStrategy}
			{missionControlMinCycles}
			{missionControlFundCycles}
			{missionControl}
			{userEmail}
			onback={() => (step = 'mission_control')}
			{onsubmit}
		/>
	{:else if step === 'mission_control_strategy'}
		<MonitoringCreateStrategy
			bind:minCycles={missionControlMinCycles}
			bind:fundCycles={missionControlFundCycles}
			strategy="mission-control"
			onback={() => (step = 'mission_control')}
			oncontinue={gotoReviewOrNotifications}
		/>
	{:else if step === 'mission_control'}
		<MonitoringCreateStrategyMissionControl
			{missionControl}
			onno={() => (step = 'mission_control_strategy')}
			onyes={gotoReviewOrNotifications}
		/>
	{:else if step === 'strategy'}
		<MonitoringCreateStrategyWithDefault
			bind:minCycles
			bind:fundCycles
			bind:useAsDefaultStrategy
			strategy="modules"
			onback={() => (step = 'init')}
			oncontinue={() => (step = 'mission_control')}
		/>
	{:else}
		<MonitoringSelectSegments
			{missionControlId}
			bind:selectedSatellites
			bind:selectedOrbiters
			oncontinue={() => (step = 'strategy')}
		>
			<h2>{$i18n.monitoring.monitoring_strategy}</h2>

			<p>{$i18n.monitoring.create_info}</p>
		</MonitoringSelectSegments>
	{/if}
</Modal>

<style lang="scss">
	@use '../../styles/mixins/overlay';

	.msg {
		@include overlay.message;
	}
</style>
