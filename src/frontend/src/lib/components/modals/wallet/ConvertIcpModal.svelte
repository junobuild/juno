<script lang="ts">
	import { fade } from 'svelte/transition';
	import Modal from '$lib/components/ui/Modal.svelte';
	import ConvertIcpForm from '$lib/components/wallet/convert/ConvertIcpForm.svelte';
	import ConvertIcpReview from '$lib/components/wallet/convert/ConvertIcpReview.svelte';
	import ProgressConvertIcp from '$lib/components/wallet/convert/ProgressConvertIcp.svelte';
	import { authIdentity } from '$lib/derived/auth.derived';
	import { convertIcpToCycles } from '$lib/services/wallet/convert.icp-to-cycles.services';
	import { wizardBusy } from '$lib/stores/app/busy.store';
	import { i18n } from '$lib/stores/app/i18n.store';
	import type { JunoModalConvertIcpToCyclesDetails, JunoModalDetail } from '$lib/types/modal';
	import type { ConvertIcpProgress } from '$lib/types/progress-convert-icp';

	interface Props {
		detail: JunoModalDetail;
		onclose: () => void;
	}

	let { onclose, detail }: Props = $props();

	let { selectedWallet } = $derived(detail as JunoModalConvertIcpToCyclesDetails);

	let step: 'init' | 'review' | 'in_progress' | 'ready' | 'error' = $state('init');

	let amount = $state<string | undefined>(undefined);
	let displayTCycles = $state<string | undefined>(undefined);

	let progress = $state<ConvertIcpProgress | undefined>(undefined);
	const onProgress = (convertIcpProgress: ConvertIcpProgress | undefined) =>
		(progress = convertIcpProgress);

	const onsubmit = async ($event: SubmitEvent) => {
		$event.preventDefault();

		onProgress(undefined);

		wizardBusy.start();
		step = 'in_progress';

		const { success } = await convertIcpToCycles({
			selectedWallet,
			identity: $authIdentity,
			balance,
			amount,
			onProgress
		});

		wizardBusy.stop();

		if (success !== 'ok') {
			step = 'init';
			return;
		}

		step = 'ready';
	};

	let balance = $state<bigint>(0n);
</script>

<Modal {onclose}>
	{#if step === 'ready'}
		<div class="msg">
			<p>{$i18n.wallet.convert_done}</p>

			<button onclick={onclose}>{$i18n.core.close}</button>
		</div>
	{:else if step === 'in_progress'}
		<ProgressConvertIcp {progress} />
	{:else if step === 'review'}
		<div in:fade>
			<ConvertIcpReview
				{amount}
				{balance}
				{displayTCycles}
				onback={() => (step = 'init')}
				{onsubmit}
				{selectedWallet}
			/>
		</div>
	{:else}
		<ConvertIcpForm
			onreview={() => (step = 'review')}
			bind:selectedWallet
			bind:balance
			bind:amount
			bind:displayTCycles
		/>
	{/if}
</Modal>

<style lang="scss">
	@use '../../../styles/mixins/overlay';

	.msg {
		@include overlay.message;
	}

	button {
		margin-top: var(--padding-2x);
	}
</style>
