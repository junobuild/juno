<script lang="ts">
	import { fromNullable, nonNullish, uint8ArrayToHexString } from '@dfinity/utils';
	import ConfirmChange from '$lib/components/changes/wizard/ConfirmChange.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import type { JunoModalApplyProposal, JunoModalDetail } from '$lib/types/modal';

	interface Props {
		detail: JunoModalDetail;
		onclose: () => void;
	}

	let { detail, onclose }: Props = $props();

	let proposalRecord = $derived((detail as JunoModalApplyProposal).proposal);

	let { proposal_id: proposalId } = $derived(proposalRecord[0]);
	let { sha256, proposal_type: proposalType } = $derived(proposalRecord[1]);

	let nullishSha256 = $derived(fromNullable(sha256));
	let proposalHash = $derived(
		nonNullish(nullishSha256) ? uint8ArrayToHexString(nullishSha256) : undefined
	);

	let takeSnapshot = $state(false);

	let step: 'init' | 'in_progress' | 'ready' | 'error' = $state('init');

	const onsubmit = async ($event: SubmitEvent) => {
		$event.preventDefault();
	};
</script>

<Modal {onclose}>
	{#if step === 'ready'}{:else if step === 'in_progress'}{:else}
		<ConfirmChange
			{proposalId}
			{proposalType}
			{proposalHash}
			bind:takeSnapshot
			{onclose}
			{onsubmit}
		/>
	{/if}
</Modal>

<style lang="scss">
	@use '../../styles/mixins/overlay';

	.msg {
		@include overlay.message;
	}
</style>
