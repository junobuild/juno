<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import type { PrincipalText } from '@dfinity/zod-schemas';
	import FactoryAdvancedOptions from '$lib/components/factory/create/FactoryAdvancedOptions.svelte';
	import FactoryCredits from '$lib/components/factory/create/FactoryCredits.svelte';
	import FactoryProgressCreate from '$lib/components/factory/create/FactoryProgressCreate.svelte';
	import Confetti from '$lib/components/ui/Confetti.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import { authSignedOut, authIdentity } from '$lib/derived/auth.derived';
	import type { SelectedWallet } from '$lib/schemas/wallet.schema';
	import { createMissionControlWizard } from '$lib/services/factory/factory-wizard.services';
	import { wizardBusy } from '$lib/stores/app/busy.store';
	import { i18n } from '$lib/stores/app/i18n.store';
	import type { JunoModalDetail } from '$lib/types/modal';
	import type { WizardCreateProgress } from '$lib/types/progress-wizard';
	import type { Option } from '$lib/types/utils';

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

	let attachProgressText = $state(`${$i18n.mission_control.attaching}...`);
	const onAttachTextProgress = (text: string) => (attachProgressText = text);

	const onSubmit = async ($event: SubmitEvent) => {
		$event.preventDefault();

		onProgress(undefined);

		wizardBusy.start();
		step = 'in_progress';

		const { success } = await createMissionControlWizard({
			selectedWallet,
			identity: $authIdentity,
			subnetId,
			withFee,
			onProgress,
			onAttachTextProgress
		});

		wizardBusy.stop();

		if (success === 'error') {
			step = 'error';
			return;
		}

		setTimeout(() => (step = 'ready'), 500);
	};

	let selectedWallet = $state<SelectedWallet | undefined>(undefined);
	let subnetId = $state<PrincipalText | undefined>(undefined);
</script>

<Modal {onclose}>
	{#if step === 'ready'}
		<Confetti />

		<div class="msg">
			<p>{$i18n.mission_control.ready}</p>
			<button onclick={onclose}>{$i18n.core.close}</button>
		</div>
	{:else if step === 'in_progress'}
		<FactoryProgressCreate
			{attachProgressText}
			{progress}
			segment="mission_control"
			withApprove={selectedWallet?.type === 'dev' && nonNullish(withFee)}
			withAttach={true}
			withMonitoring={false}
		/>
	{:else}
		<h2>{$i18n.core.getting_started}</h2>

		<p>
			{$i18n.mission_control.description}
		</p>

		<FactoryCredits
			{detail}
			{onclose}
			priceLabel={$i18n.mission_control.create_price}
			{selectedWallet}
			bind:withFee
			bind:insufficientFunds
		>
			<form onsubmit={onSubmit}>
				<FactoryAdvancedOptions {detail} withMonitoring={false} bind:selectedWallet bind:subnetId />

				<button disabled={$authSignedOut || insufficientFunds} type="submit">
					{$i18n.core.create}
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
