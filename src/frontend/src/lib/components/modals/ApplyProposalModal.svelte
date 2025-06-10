<script lang="ts">
	import type { JunoModalApplyProposal, JunoModalDetail } from '$lib/types/modal';
	import { fromNullable, nonNullish, uint8ArrayToHexString } from '@dfinity/utils';
	import Modal from '$lib/components/ui/Modal.svelte';

	interface Props {
		detail: JunoModalDetail;
		onclose: () => void;
	}

	let { detail, onclose }: Props = $props();

	let proposalRecord = $derived((detail as JunoModalApplyProposal).proposal);

	let { proposal_id } = $derived(proposalRecord[0]);
	let { sha256, proposal_type } = $derived(proposalRecord[1]);

	let nullishSha256 = $derived(fromNullable(sha256));
	let hash = $derived(nonNullish(nullishSha256) ? uint8ArrayToHexString(nullishSha256) : undefined);

	let step: 'init' | 'in_progress' | 'ready' | 'error' = $state('init');
</script>

<Modal {onclose}>
	{#if step === 'ready'}

	{:else if step === 'in_progress'}

	{:else}{/if}
</Modal>

<style lang="scss">
	@use '../../styles/mixins/overlay';

	.msg {
		@include overlay.message;
	}
</style>
