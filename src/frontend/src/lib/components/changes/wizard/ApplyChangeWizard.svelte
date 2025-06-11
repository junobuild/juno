<script lang="ts">
	import { fromNullable, nonNullish, uint8ArrayToHexString } from '@dfinity/utils';
	import type { ApplyProposalProgress } from '@junobuild/cdn';
	import ApplyChangeDone from '$lib/components/changes/wizard/ApplyChangeDone.svelte';
	import ConfirmApplyChange from '$lib/components/changes/wizard/ConfirmApplyChange.svelte';
	import ProgressApplyChange from '$lib/components/changes/wizard/ProgressApplyChange.svelte';
	import { applyProposal } from '$lib/services/proposals/proposals.services';
	import { authStore } from '$lib/stores/auth.store';
	import type { ProposalRecord } from '$lib/types/proposals';
	import type { SatelliteIdText } from '$lib/types/satellite';

	interface Props {
		proposal: ProposalRecord;
		satelliteId: SatelliteIdText;
		onclose: () => void;
		startUpgrade: () => void;
	}

	let { proposal: proposalRecord, satelliteId, onclose, startUpgrade }: Props = $props();

	let { proposal_id: proposalId } = $derived(proposalRecord[0]);
	let { sha256, proposal_type: proposalType } = $derived(proposalRecord[1]);

	let nullishSha256 = $derived(fromNullable(sha256));
	let proposalHash = $derived(
		nonNullish(nullishSha256) ? uint8ArrayToHexString(nullishSha256) : undefined
	);

	let proposalClearExistingAssets = $derived(
		'AssetsUpgrade' in proposalType
			? fromNullable(proposalType.AssetsUpgrade.clear_existing_assets) === true
			: false
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

{#if step === 'ready'}
	<ApplyChangeDone {proposalType} {onclose} {startUpgrade} />
{:else if step === 'in_progress'}
	<ProgressApplyChange
		{progress}
		{proposalClearExistingAssets}
		{takeSnapshot}
		{clearProposalAssets}
	/>
{:else}
	<ConfirmApplyChange
		{proposalId}
		{proposalType}
		{proposalHash}
		{proposalClearExistingAssets}
		bind:clearProposalAssets
		bind:takeSnapshot
		{onclose}
		{onsubmit}
	/>
{/if}
