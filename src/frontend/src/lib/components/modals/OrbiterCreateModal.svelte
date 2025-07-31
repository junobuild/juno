<script lang="ts">
	import { isNullish, nonNullish } from '@dfinity/utils';
	import type { PrincipalText } from '@dfinity/zod-schemas';
	import type { CyclesMonitoringStrategy } from '$declarations/mission_control/mission_control.did';
	import CanisterAdvancedOptions from '$lib/components/canister/CanisterAdvancedOptions.svelte';
	import ProgressCreate from '$lib/components/canister/ProgressCreate.svelte';
	import CreditsGuard from '$lib/components/guards/CreditsGuard.svelte';
	import Confetti from '$lib/components/ui/Confetti.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import { authSignedOut } from '$lib/derived/auth.derived';
	import { missionControlIdDerived } from '$lib/derived/mission-control.derived';
	import { createOrbiterWizard } from '$lib/services/wizard.services';
	import { authStore } from '$lib/stores/auth.store';
	import { wizardBusy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';
	import type { JunoModalDetail } from '$lib/types/modal';
	import type { WizardCreateProgress } from '$lib/types/progress-wizard';

	interface Props {
		detail: JunoModalDetail;
		onclose: () => void;
	}

	let { detail, onclose }: Props = $props();

	let withCredits = $state(false);
	let insufficientFunds = $state(true);

	let step: 'init' | 'in_progress' | 'ready' | 'error' = $state('init');

	// Submit

	let progress: WizardCreateProgress | undefined = $state(undefined);
	const onProgress = (applyProgress: WizardCreateProgress | undefined) =>
		(progress = applyProgress);

	const onSubmit = async ($event: SubmitEvent) => {
		$event.preventDefault();

		onProgress(undefined);

		wizardBusy.start();
		step = 'in_progress';

		const { success } = await createOrbiterWizard({
			identity: $authStore.identity,
			missionControlId: $missionControlIdDerived,
			subnetId,
			monitoringStrategy,
			withCredits,
			onProgress
		});

		wizardBusy.stop();

		if (success !== 'ok') {
			step = 'error';
			return;
		}

		setTimeout(() => (step = 'ready'), 500);
	};

	let subnetId: PrincipalText | undefined = $state();
	let monitoringStrategy: CyclesMonitoringStrategy | undefined = $state();
</script>

<Modal {onclose}>
	{#if step === 'ready'}
		<Confetti />

		<div class="msg">
			<p>{$i18n.analytics.ready}</p>
			<button onclick={onclose}>{$i18n.core.close}</button>
		</div>
	{:else if step === 'in_progress'}
		<ProgressCreate {progress} segment="orbiter" withMonitoring={nonNullish(monitoringStrategy)} />
	{:else}
		<h2>{$i18n.core.getting_started}</h2>

		<p>
			{$i18n.analytics.description}
		</p>

		<CreditsGuard
			{detail}
			{onclose}
			priceLabel={$i18n.analytics.create_orbiter_price}
			bind:insufficientFunds
			bind:withCredits
		>
			<form onsubmit={onSubmit}>
				<CanisterAdvancedOptions {detail} bind:subnetId bind:monitoringStrategy />

				<button
					disabled={$authSignedOut || isNullish($missionControlIdDerived) || insufficientFunds}
					type="submit">{$i18n.analytics.create}</button
				>
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
</style>
