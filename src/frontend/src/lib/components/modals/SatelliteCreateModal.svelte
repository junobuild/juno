<script lang="ts">
	import { isNullish, nonNullish } from '@dfinity/utils';
	import type { PrincipalText } from '@dfinity/zod-schemas';
	import type {
		CyclesMonitoringStrategy,
		Satellite
	} from '$declarations/mission_control/mission_control.did';
	import CanisterAdvancedOptions from '$lib/components/canister/CanisterAdvancedOptions.svelte';
	import ProgressCreate from '$lib/components/canister/ProgressCreate.svelte';
	import CreditsGuard from '$lib/components/guards/CreditsGuard.svelte';
	import Confetti from '$lib/components/ui/Confetti.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { testIds } from '$lib/constants/test-ids.constants';
	import { authSignedOut } from '$lib/derived/auth.derived';
	import { missionControlIdDerived } from '$lib/derived/mission-control.derived';
	import { createSatelliteWizard } from '$lib/services/wizard.services';
	import { authStore } from '$lib/stores/auth.store';
	import { wizardBusy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';
	import type { JunoModalDetail } from '$lib/types/modal';
	import type { WizardCreateProgress } from '$lib/types/progress-wizard';
	import { navigateToSatellite } from '$lib/utils/nav.utils';
	import { testId } from '$lib/utils/test.utils';

	interface Props {
		detail: JunoModalDetail;
		onclose: () => void;
	}

	let { detail, onclose }: Props = $props();

	let withCredits = $state(false);
	let insufficientFunds = $state(true);

	let step: 'init' | 'in_progress' | 'ready' | 'error' = $state('init');
	let satellite: Satellite | undefined = undefined;

	// Submit

	let progress: WizardCreateProgress | undefined = $state(undefined);
	const onProgress = (applyProgress: WizardCreateProgress | undefined) =>
		(progress = applyProgress);

	const onSubmit = async ($event: SubmitEvent) => {
		$event.preventDefault();

		onProgress(undefined);

		wizardBusy.start();
		step = 'in_progress';

		const result = await createSatelliteWizard({
			identity: $authStore.identity,
			missionControlId: $missionControlIdDerived,
			subnetId,
			monitoringStrategy,
			satelliteName,
			withCredits,
			onProgress
		});

		wizardBusy.stop();

		if (result.success !== 'ok') {
			step = 'error';
			return;
		}

		satellite = result.segment;

		setTimeout(() => (step = 'ready'), 500);
	};

	const navigate = async () => {
		await navigateToSatellite(satellite?.satellite_id);
		onclose();
	};

	let satelliteName: string | undefined = $state(undefined);
	let subnetId: PrincipalText | undefined = $state();
	let monitoringStrategy: CyclesMonitoringStrategy | undefined = $state();
</script>

<Modal {onclose}>
	{#if step === 'ready'}
		<Confetti />

		<div class="msg">
			<p>{$i18n.satellites.ready}</p>
			<button {...testId(testIds.createSatellite.continue)} onclick={navigate}>
				{$i18n.core.continue}
			</button>
		</div>
	{:else if step === 'in_progress'}
		<ProgressCreate
			{progress}
			segment="satellite"
			withMonitoring={nonNullish(monitoringStrategy)}
		/>
	{:else}
		<h2>{$i18n.satellites.start}</h2>

		<p>
			{$i18n.satellites.description}
		</p>

		<CreditsGuard
			{detail}
			{onclose}
			priceLabel={$i18n.satellites.create_satellite_price}
			bind:withCredits
			bind:insufficientFunds
		>
			<form onsubmit={onSubmit}>
				<Value>
					{#snippet label()}
						{$i18n.satellites.satellite_name}
					{/snippet}
					<input
						name="satellite_name"
						autocomplete="off"
						data-1p-ignore
						{...testId(testIds.createSatellite.input)}
						placeholder={$i18n.satellites.enter_name}
						required
						type="text"
						bind:value={satelliteName}
					/>
				</Value>

				<CanisterAdvancedOptions {detail} bind:subnetId bind:monitoringStrategy />

				<button
					{...testId(testIds.createSatellite.create)}
					disabled={$authSignedOut || isNullish($missionControlIdDerived) || insufficientFunds}
					type="submit"
				>
					{$i18n.satellites.create}
				</button>
			</form>
		</CreditsGuard>
	{/if}
</Modal>

<style lang="scss">
	@use '../../styles/mixins/overlay';

	h2 {
		@include overlay.title;
	}

	.msg {
		@include overlay.message;

		p {
			margin: var(--padding-8x) 0 0;
		}
	}

	form {
		display: flex;
		flex-direction: column;

		padding: var(--padding-2x) 0 0;
	}

	button {
		margin-top: var(--padding-2x);
	}
</style>
