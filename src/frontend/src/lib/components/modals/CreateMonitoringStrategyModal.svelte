<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { nonNullish, notEmptyString , fromNullishNullable } from '@dfinity/utils';
	import type {
		CyclesMonitoringStrategy,
		Orbiter,
		Satellite
	} from '$declarations/mission_control/mission_control.did';
	import MonitoringCreateSelectStrategy from '$lib/components/monitoring/MonitoringCreateSelectStrategy.svelte';
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
	import type { JunoModalDetail, JunoModalCreateMonitoringStrategyDetail } from '$lib/types/modal';
	import type { MonitoringStrategyProgress } from '$lib/types/progress-strategy';
	import type { Option } from '$lib/types/utils';
		import { metadataEmail } from '$lib/utils/metadata.utils';

	interface Props {
		detail: JunoModalDetail;
		onclose: () => void;
	}

	let { detail, onclose }: Props = $props();

	let { settings, user, missionControlId } = $derived(
		detail as JunoModalCreateMonitoringStrategyDetail
	);

	// Wizard navigation

	type Steps =
		| 'init'
		| 'select_strategy'
		| 'strategy'
		| 'mission_control'
		| 'mission_control_strategy'
		| 'review'
		| 'in_progress'
		| 'notifications'
		| 'ready';

	let step: Steps = $state('init');

	let steps: Steps[] = $state([]);

	const nextReviewOrNotifications = () => next(hasMissionControlEmail ? 'review' : 'notifications');

	const next = (nextStep: Steps) => {
		steps.push(step);
		step = nextStep;
	};

	const back = () => {
		step = steps.pop() ?? 'init';
	};

	const reset = (restartStep: 'init' | 'ready') => {
		steps = [];
		step = restartStep;
	};

	// Monitoring strategy

	let selectedSatellites: [Principal, Satellite][] = $state([]);
	let selectedOrbiters: [Principal, Orbiter][] = $state([]);

	let minCycles: bigint | undefined = $state(undefined);
	let fundCycles: bigint | undefined = $state(undefined);

	let missionControlMinCycles: bigint | undefined = $state(undefined);
	let missionControlFundCycles: bigint | undefined = $state(undefined);

	let missionControlCycles = $derived(
		fromNullishNullable(fromNullishNullable(settings?.monitoring)?.cycles)
	);

	let missionControl: { monitored: boolean; strategy: CyclesMonitoringStrategy | undefined } =
		$derived({
			monitored: missionControlCycles?.enabled === true,
			strategy: fromNullishNullable(missionControlCycles?.strategy)
		});

	// Monitoring email

	let metadata = $derived(user.metadata);
	let missionControlEmail = $derived(metadataEmail(metadata));
	let hasMissionControlEmail = $derived(nonNullish(missionControlEmail));
	let userEmail: Option<string> = $state(undefined);

	// Strategy choice

	let reuseStrategy: CyclesMonitoringStrategy | undefined = $state(undefined);

	const onSelectStrategy = (strategy?: CyclesMonitoringStrategy) => {
		reuseStrategy = strategy;

		if (nonNullish(strategy)) {
			nextReviewOrNotifications();
			return;
		}

		next('strategy');
	};

	// Monitoring config

	let monitoringConfig = $derived(
		fromNullishNullable(fromNullishNullable(user?.config)?.monitoring)
	);

	let defaultStrategy = $derived(
		fromNullishNullable(fromNullishNullable(monitoringConfig?.cycles)?.default_strategy)
	);

	let saveAsDefaultStrategy = $state(false);

	let withOptions: ApplyMonitoringCyclesStrategyOptions | undefined = $derived(
		saveAsDefaultStrategy || (nonNullish(userEmail) && notEmptyString(userEmail))
			? {
					monitoringConfig,
					saveAsDefaultStrategy,
					userEmail,
					metadata
				}
			: undefined
	);

	// Submit

	let progress: MonitoringStrategyProgress | undefined = $state(undefined);
	const onProgress = (applyProgress: MonitoringStrategyProgress | undefined) =>
		(progress = applyProgress);

	const onsubmit = async ($event: MouseEvent | TouchEvent) => {
		$event.preventDefault();

		onProgress(undefined);

		wizardBusy.start();
		next('in_progress');

		const { success } = await applyMonitoringCyclesStrategy({
			identity: $authStore.identity,
			missionControlId,
			satellites: selectedSatellites.map(([id, _]) => id),
			orbiters: selectedOrbiters.map(([id, _]) => id),
			fundCycles,
			minCycles,
			reuseStrategy,
			missionControlMonitored: missionControl.monitored,
			missionControlMinCycles,
			missionControlFundCycles,
			options: withOptions,
			onProgress
		});

		wizardBusy.stop();

		if (success !== 'ok') {
			reset('init');
			return;
		}

		setTimeout(() => reset('ready'), 500);
	};
</script>

<Modal on:junoClose={onclose} onback={step === 'mission_control' ? back : undefined}>
	{#if step === 'ready'}
		<div class="msg">
			<p>
				{$i18n.monitoring.auto_refill_activated}
			</p>
			<button onclick={onclose}>{$i18n.core.close}</button>
		</div>
	{:else if step === 'in_progress'}
		<ProgressMonitoring {progress} action="create" withOptions={nonNullish(withOptions)} />
	{:else if step === 'notifications'}
		<MonitoringCreateStrategyNotifications
			onback={back}
			oncontinue={(email) => {
				userEmail = email;
				next('review');
			}}
		/>
	{:else if step === 'review'}
		<MonitoringCreateStrategyReview
			{selectedSatellites}
			{selectedOrbiters}
			{minCycles}
			{fundCycles}
			{saveAsDefaultStrategy}
			{missionControlMinCycles}
			{missionControlFundCycles}
			{missionControl}
			{userEmail}
			{reuseStrategy}
			onback={back}
			{onsubmit}
		/>
	{:else if step === 'mission_control_strategy'}
		<MonitoringCreateStrategy
			bind:minCycles={missionControlMinCycles}
			bind:fundCycles={missionControlFundCycles}
			strategy="mission-control"
			onback={back}
			oncontinue={nextReviewOrNotifications}
		/>
	{:else if step === 'mission_control'}
		<MonitoringCreateStrategyMissionControl
			{missionControl}
			onno={() => next('mission_control_strategy')}
			onyes={nextReviewOrNotifications}
		/>
	{:else if step === 'strategy'}
		<MonitoringCreateStrategyWithDefault
			bind:minCycles
			bind:fundCycles
			bind:saveAsDefaultStrategy
			{defaultStrategy}
			strategy="modules"
			onback={back}
			oncontinue={() => next('mission_control')}
		/>
	{:else if step === 'select_strategy'}
		<MonitoringCreateSelectStrategy {defaultStrategy} onback={back} oncontinue={onSelectStrategy} />
	{:else}
		<MonitoringSelectSegments
			{missionControlId}
			bind:selectedSatellites
			bind:selectedOrbiters
			oncontinue={() => next('select_strategy')}
		>
			<h2>{$i18n.core.getting_started}</h2>

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
