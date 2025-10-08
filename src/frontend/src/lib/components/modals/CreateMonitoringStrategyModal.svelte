<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { nonNullish, notEmptyString, fromNullishNullable } from '@dfinity/utils';
	import type { MissionControlDid } from '$declarations';
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

	let selectedSatellites = $state<[Principal, MissionControlDid.Satellite][]>([]);
	let selectedOrbiters = $state<[Principal, MissionControlDid.Orbiter][]>([]);

	let minCycles: bigint | undefined = $state(undefined);
	let fundCycles: bigint | undefined = $state(undefined);

	let missionControlMinCycles: bigint | undefined = $state(undefined);
	let missionControlFundCycles: bigint | undefined = $state(undefined);

	let missionControlCycles = $derived(
		fromNullishNullable(fromNullishNullable(settings?.monitoring)?.cycles)
	);

	let missionControl: {
		monitored: boolean;
		strategy: MissionControlDid.CyclesMonitoringStrategy | undefined;
	} = $derived({
		monitored: missionControlCycles?.enabled === true,
		strategy: fromNullishNullable(missionControlCycles?.strategy)
	});

	// Monitoring email

	let metadata = $derived(user.metadata);
	let missionControlEmail = $derived(metadataEmail(metadata));
	let hasMissionControlEmail = $derived(nonNullish(missionControlEmail));
	let userEmail: Option<string> = $state(undefined);

	// Strategy choice

	let reuseStrategy = $state<MissionControlDid.CyclesMonitoringStrategy | undefined>(undefined);

	const onSelectStrategy = (strategy?: MissionControlDid.CyclesMonitoringStrategy) => {
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

<Modal onback={step === 'mission_control' ? back : undefined} {onclose}>
	{#if step === 'ready'}
		<div class="msg">
			<p>
				{$i18n.monitoring.auto_refill_activated}
			</p>
			<button onclick={onclose}>{$i18n.core.close}</button>
		</div>
	{:else if step === 'in_progress'}
		<ProgressMonitoring action="create" {progress} withOptions={nonNullish(withOptions)} />
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
			{fundCycles}
			{minCycles}
			{missionControl}
			{missionControlFundCycles}
			{missionControlMinCycles}
			onback={back}
			{onsubmit}
			{reuseStrategy}
			{saveAsDefaultStrategy}
			{selectedOrbiters}
			{selectedSatellites}
			{userEmail}
		/>
	{:else if step === 'mission_control_strategy'}
		<MonitoringCreateStrategy
			onback={back}
			oncontinue={nextReviewOrNotifications}
			strategy="mission-control"
			bind:minCycles={missionControlMinCycles}
			bind:fundCycles={missionControlFundCycles}
		/>
	{:else if step === 'mission_control'}
		<MonitoringCreateStrategyMissionControl
			{missionControl}
			onno={() => next('mission_control_strategy')}
			onyes={nextReviewOrNotifications}
		/>
	{:else if step === 'strategy'}
		<MonitoringCreateStrategyWithDefault
			{defaultStrategy}
			onback={back}
			oncontinue={() => next('mission_control')}
			strategy="modules"
			bind:minCycles
			bind:fundCycles
			bind:saveAsDefaultStrategy
		/>
	{:else if step === 'select_strategy'}
		<MonitoringCreateSelectStrategy {defaultStrategy} onback={back} oncontinue={onSelectStrategy} />
	{:else}
		<MonitoringSelectSegments
			{missionControlId}
			oncontinue={() => next('select_strategy')}
			bind:selectedSatellites
			bind:selectedOrbiters
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
