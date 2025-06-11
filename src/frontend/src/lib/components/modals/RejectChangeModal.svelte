<script lang="ts">
	import { fromNullable, nonNullish, uint8ArrayToHexString } from '@dfinity/utils';
	import type { RejectProposalProgress } from '@junobuild/cdn';
	import ConfirmRejectChange from '$lib/components/changes/wizard/ConfirmRejectChange.svelte';
	import ProgressRejectChange from '$lib/components/changes/wizard/ProgressRejectChange.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import { rejectProposal } from '$lib/services/proposals/proposals.services';
	import { authStore } from '$lib/stores/auth.store';
	import { i18n } from '$lib/stores/i18n.store';
	import type { JunoModalChangeDetail, JunoModalDetail } from '$lib/types/modal';

	interface Props {
		detail: JunoModalDetail;
		onclose: () => void;
	}

	let { detail, onclose }: Props = $props();

	let proposalRecord = $derived((detail as JunoModalChangeDetail).proposal);
	let satellite = $derived((detail as JunoModalChangeDetail).satellite);

	let satelliteId = $derived(satellite.satellite_id.toText());

	let { proposal_id: proposalId } = $derived(proposalRecord[0]);
	let { sha256, proposal_type: proposalType } = $derived(proposalRecord[1]);

	let nullishSha256 = $derived(fromNullable(sha256));
	let proposalHash = $derived(
		nonNullish(nullishSha256) ? uint8ArrayToHexString(nullishSha256) : undefined
	);

	let clearProposalAssets = $state(true);

	let step: 'init' | 'in_progress' | 'ready' | 'error' = $state('init');

	let progress: RejectProposalProgress | undefined = $state(undefined);
	const onProgress = (changeProgress: RejectProposalProgress | undefined) =>
		(progress = changeProgress);

	const onsubmit = async ($event: SubmitEvent) => {
		$event.preventDefault();

		await rejectProposal({
			satelliteId,
			proposal: proposalRecord,
			identity: $authStore.identity,
			clearProposalAssets,
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
					{$i18n.changes.assets_upgrade_discarded}
				{:else}
					{$i18n.changes.segments_deployment_discarded}
				{/if}
			</p>
			<button onclick={onclose}>{$i18n.core.close}</button>
		</div>
	{:else if step === 'in_progress'}
		<ProgressRejectChange {progress} {clearProposalAssets} />
	{:else}
		<ConfirmRejectChange
			{proposalId}
			{proposalType}
			{proposalHash}
			bind:clearProposalAssets
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
