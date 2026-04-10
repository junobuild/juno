<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import type { Nullish } from '@dfinity/zod-schemas';
	import type { PrincipalText } from '@junobuild/schema';
	import type { MissionControlDid } from '$declarations';
	import FactoryContinue from '$lib/components/modules/factory/create/FactoryContinue.svelte';
	import FactoryCredits from '$lib/components/modules/factory/create/FactoryCredits.svelte';
	import FactoryProgressCreate from '$lib/components/modules/factory/create/FactoryProgressCreate.svelte';
	import CreateSatelliteMetadata from '$lib/components/satellites/factory/CreateSatelliteMetadata.svelte';
	import CreateSatelliteOptions from '$lib/components/satellites/factory/CreateSatelliteOptions.svelte';
	import CreateSatelliteReview from '$lib/components/satellites/factory/CreateSatelliteReview.svelte';
	import Confetti from '$lib/components/ui/Confetti.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import { testIds } from '$lib/constants/test-ids.constants';
	import { authSignedOut, authIdentity } from '$lib/derived/auth.derived';
	import { missionControlId } from '$lib/derived/console/account.mission-control.derived';
	import type { SelectedWallet } from '$lib/schemas/wallet.schema';
	import { createSatelliteWizard } from '$lib/services/factory/factory.create.services';
	import { wizardBusy } from '$lib/stores/app/busy.store';
	import { i18n } from '$lib/stores/app/i18n.store';
	import type { JunoModalDetail } from '$lib/types/modal';
	import type { FactoryCreateProgress } from '$lib/types/progress-factory-create';
	import type { SatelliteId } from '$lib/types/satellite';
	import { navigateToSatellite } from '$lib/utils/nav.utils';

	interface Props {
		detail: JunoModalDetail;
		onclose: () => void;
	}

	let { detail, onclose }: Props = $props();

	let withFee = $state<Nullish<bigint>>(undefined);
	let insufficientFunds = $state(true);

	let step: 'init' | 'metadata' | 'options' | 'review' | 'in_progress' | 'ready' | 'error' =
		$state('init');
	let satelliteId = $state<SatelliteId | undefined>(undefined);

	const oncontinue = () => {
		switch (step) {
			case 'init':
				step = 'metadata';
				break;
			case 'metadata':
				step = 'options';
				break;
			case 'options':
				step = 'review';
				break;
		}
	};

	const onback = () => {
		switch (step) {
			case 'metadata':
				step = 'init';
				break;
			case 'options':
				step = 'metadata';
				break;
			case 'review':
				step = 'options';
				break;
		}
	};

	// Submit

	let progress: FactoryCreateProgress | undefined = $state(undefined);
	const onProgress = (applyProgress: FactoryCreateProgress | undefined) =>
		(progress = applyProgress);

	const onsubmit = async ($event: SubmitEvent) => {
		$event.preventDefault();

		onProgress(undefined);

		wizardBusy.start();
		step = 'in_progress';

		const result = await createSatelliteWizard({
			selectedWallet,
			identity: $authIdentity,
			missionControlId: $missionControlId,
			subnetId,
			monitoringStrategy,
			satelliteName,
			satelliteKind,
			withFee,
			onProgress
		});

		wizardBusy.stop();

		if (result.success !== 'ok') {
			step = 'error';
			return;
		}

		satelliteId = result.canisterId;

		setTimeout(() => (step = 'ready'), 500);
	};

	const navigate = async () => {
		await navigateToSatellite(satelliteId);
	};

	let satelliteName = $state<string | undefined>(undefined);
	let satelliteKind = $state<'website' | 'application' | undefined>(undefined);

	let selectedWallet = $state<SelectedWallet | undefined>(undefined);
	let subnetId: PrincipalText | undefined = $state();
	let monitoringStrategy = $state<MissionControlDid.CyclesMonitoringStrategy | undefined>(
		undefined
	);
</script>

<Modal {onclose}>
	{#if step === 'ready'}
		<Confetti />

		<FactoryContinue {navigate} {onclose} testId={testIds.createSatellite.continue}>
			{$i18n.satellites.ready}
		</FactoryContinue>
	{:else if step === 'in_progress'}
		<FactoryProgressCreate
			{progress}
			segment="satellite"
			withApprove={selectedWallet?.type === 'dev' && nonNullish(withFee)}
			withAttach={selectedWallet?.type === 'dev' && nonNullish($missionControlId)}
			withMonitoring={nonNullish(monitoringStrategy)}
		/>
	{:else if step === 'options'}
		<CreateSatelliteOptions
			{detail}
			{onback}
			{oncontinue}
			bind:satelliteKind
			bind:subnetId
			bind:monitoringStrategy
		/>
	{:else if step === 'metadata'}
		<CreateSatelliteMetadata {onback} {oncontinue} bind:satelliteName />
	{:else if step === 'review'}
		<CreateSatelliteReview
			disabled={$authSignedOut || insufficientFunds}
			{monitoringStrategy}
			{onback}
			{onsubmit}
			{satelliteKind}
			{satelliteName}
			{selectedWallet}
			{subnetId}
			{withFee}
		/>
	{:else}
		<h2>{$i18n.satellites.start}</h2>

		<FactoryCredits
			{detail}
			{onclose}
			priceLabel={$i18n.satellites.create_satellite_price}
			bind:selectedWallet
			bind:withFee
			bind:insufficientFunds
		>
			{#snippet withCreditsMsg()}
				<p>{$i18n.satellites.hooray_free_satellite}</p>
			{/snippet}

			<button onclick={onclose}>{$i18n.core.cancel}</button>
			<button onclick={oncontinue}
				>{nonNullish(withFee) ? $i18n.core.continue : $i18n.core.lets_go}</button
			>
		</FactoryCredits>
	{/if}
</Modal>

<style lang="scss">
	@use '../../../../styles/mixins/overlay';

	h2 {
		@include overlay.title;
	}

	form {
		display: flex;
		flex-direction: column;

		padding: var(--padding) 0 0;
	}

	button {
		margin-top: var(--padding-2x);
	}
</style>
