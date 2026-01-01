<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import type { PrincipalText } from '@dfinity/zod-schemas';
	import type { MissionControlDid } from '$declarations';
	import FactoryAdvancedOptions from '$lib/components/factory/FactoryAdvancedOptions.svelte';
	import FactoryCredits from '$lib/components/factory/FactoryCredits.svelte';
	import FactoryProgressCreate from '$lib/components/factory/FactoryProgressCreate.svelte';
	import Confetti from '$lib/components/ui/Confetti.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import { testIds } from '$lib/constants/test-ids.constants';
	import { authSignedOut, authIdentity } from '$lib/derived/auth.derived';
	import { missionControlId } from '$lib/derived/console/account.mission-control.derived';
	import type { SelectedWallet } from '$lib/schemas/wallet.schema';
	import { createOrbiterWizard } from '$lib/services/factory/factory-wizard.services';
	import { wizardBusy } from '$lib/stores/app/busy.store';
	import { i18n } from '$lib/stores/app/i18n.store';
	import type { JunoModalDetail } from '$lib/types/modal';
	import type { WizardCreateProgress } from '$lib/types/progress-wizard';
	import type { Option } from '$lib/types/utils';
	import { testId } from '$lib/utils/test.utils';

	interface Props {
		detail: JunoModalDetail;
		onclose: () => void;
	}

	let { detail, onclose }: Props = $props();

	let withFee = $state<Option<bigint>>(undefined);
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
			selectedWallet,
			identity: $authIdentity,
			missionControlId: $missionControlId,
			subnetId,
			monitoringStrategy,
			withFee,
			onProgress
		});

		wizardBusy.stop();

		if (success !== 'ok') {
			step = 'error';
			return;
		}

		setTimeout(() => (step = 'ready'), 500);
	};

	let selectedWallet = $state<SelectedWallet | undefined>(undefined);
	let subnetId = $state<PrincipalText | undefined>(undefined);
	let monitoringStrategy = $state<MissionControlDid.CyclesMonitoringStrategy | undefined>(
		undefined
	);
</script>

<Modal {onclose}>
	{#if step === 'ready'}
		<Confetti />

		<div class="msg">
			<p>{$i18n.analytics.ready}</p>
			<button onclick={onclose} {...testId(testIds.createAnalytics.close)}
				>{$i18n.core.close}</button
			>
		</div>
	{:else if step === 'in_progress'}
		<FactoryProgressCreate
			{progress}
			segment="orbiter"
			withApprove={selectedWallet?.type === 'dev' && nonNullish(withFee)}
			withAttach={nonNullish($missionControlId)}
			withMonitoring={nonNullish(monitoringStrategy)}
		/>
	{:else}
		<h2>{$i18n.core.getting_started}</h2>

		<p>
			{$i18n.analytics.description}
		</p>

		<FactoryCredits
			{detail}
			{onclose}
			priceLabel={$i18n.analytics.create_orbiter_price}
			{selectedWallet}
			bind:withFee
			bind:insufficientFunds
		>
			<form onsubmit={onSubmit}>
				<FactoryAdvancedOptions
					{detail}
					bind:selectedWallet
					bind:subnetId
					bind:monitoringStrategy
				/>

				<button
					{...testId(testIds.createAnalytics.create)}
					disabled={$authSignedOut || insufficientFunds}
					type="submit"
				>
					{$i18n.analytics.create}
				</button>
			</form>
		</FactoryCredits>
	{/if}
</Modal>

<style lang="scss">
	@use '../../../../styles/mixins/overlay';

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
