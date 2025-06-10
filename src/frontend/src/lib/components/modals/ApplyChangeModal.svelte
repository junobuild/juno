<script lang="ts">
	import { fromNullable, nonNullish, uint8ArrayToHexString } from '@dfinity/utils';
	import type { ApplyProposalProgress } from '@junobuild/cdn';
	import ConfirmChange from '$lib/components/changes/wizard/ConfirmChange.svelte';
	import ProgressApplyChange from '$lib/components/changes/wizard/ProgressApplyChange.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import { applyProposal } from '$lib/services/proposals/proposals.services';
	import { authStore } from '$lib/stores/auth.store';
	import { i18n } from '$lib/stores/i18n.store';
	import type { JunoModalApplyProposal, JunoModalDetail } from '$lib/types/modal';

	interface Props {
		detail: JunoModalDetail;
		onclose: () => void;
	}

	let { detail, onclose }: Props = $props();

	let proposalRecord = $derived((detail as JunoModalApplyProposal).proposal);
	let satelliteId = $derived((detail as JunoModalApplyProposal).satelliteId);

	let { proposal_id: proposalId } = $derived(proposalRecord[0]);
	let { sha256, proposal_type: proposalType } = $derived(proposalRecord[1]);

	let nullishSha256 = $derived(fromNullable(sha256));
	let proposalHash = $derived(
		nonNullish(nullishSha256) ? uint8ArrayToHexString(nullishSha256) : undefined
	);

	let clearProposalAssets = $state(true);
	let takeSnapshot = $state(false);

	let step: 'init' | 'in_progress' | 'ready' | 'error' = $state('init');

	let progress: ApplyProposalProgress | undefined = $state(undefined);
	const onProgress = (changeProgress: ApplyProposalProgress | undefined) =>
		(progress = changeProgress);

	const onsubmit = async ($event: SubmitEvent) => {
		$event.preventDefault();

		await applyProposal({
			satelliteId,
			proposal: proposalRecord,
			identity: $authStore.identity,
			clearProposalAssets,
			takeSnapshot,
			nextSteps: (next) => (step = next),
			onProgress
		});
	};
</script>

<Modal {onclose}>
	{#if step === 'ready'}
		<div class="msg">
			<p>
				{#if 'AssetsUpgrade' in proposalType}
					{$i18n.changes.assets_upgrade_applied}
				{:else}
					{$i18n.changes.segments_deployment_applied}
				{/if}
			</p>
			<button onclick={onclose}>{$i18n.core.close}</button>
		</div>
	{:else if step === 'in_progress'}
		<ProgressApplyChange {progress} {takeSnapshot} {clearProposalAssets} />
	{:else}
		<ConfirmChange
			{proposalId}
			{proposalType}
			{proposalHash}
			bind:clearProposalAssets
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
