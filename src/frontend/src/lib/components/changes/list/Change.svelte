<script lang="ts">
	import { fromNullable, nonNullish, uint8ArrayToHexString } from '@dfinity/utils';
	import Identifier from '$lib/components/ui/Identifier.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { ProposalRecord } from '$lib/types/proposals';
	import { formatToDate } from '$lib/utils/date.utils';
	import IconArrowCircleUp from "$lib/components/icons/IconArrowCircleUp.svelte";
	import {emit} from "$lib/utils/events.utils";

	interface Props {
		proposal: ProposalRecord;
	}

	let { proposal: proposalRecord }: Props = $props();

	let { proposal_id } = $derived(proposalRecord[0]);
	let { sha256, proposal_type, created_at } = $derived(proposalRecord[1]);

	let nullishSha256 = $derived(fromNullable(sha256));
	let hash = $derived(nonNullish(nullishSha256) ? uint8ArrayToHexString(nullishSha256) : undefined);

	let proposalType = $derived(
		'AssetsUpgrade' in proposal_type
			? $i18n.changes.assets_upgrade
			: $i18n.changes.segments_deployment
	);

	const openApplyProposal = () => {
		emit({
			message: 'junoModal',
			detail: {
				type: 'apply_proposal',
				detail: { proposal: proposalRecord }
			}
		});
	};
</script>

<tr>
	<td>
		<button class="square" aria-label={$i18n.core.apply} onclick={openApplyProposal}
		><IconArrowCircleUp size="20px" /></button
		>
	</td>
	<td><Identifier small={false} identifier={`${proposal_id}`} /></td>
	<td class="hash"
		>{#if nonNullish(hash)}<Identifier small={false} identifier={hash} />{/if}</td
	>
	<td>{proposalType}</td>
	<td class="created_at">
		{formatToDate(created_at)}
	</td></tr
>

<style lang="scss">
	@use '../../../styles/mixins/media';

	.hash {
		display: none;

		@include media.min-width(small) {
			display: table-cell;
		}
	}

	.created_at {
		display: none;

		@include media.min-width(medium) {
			display: table-cell;
		}
	}

	button {
		vertical-align: middle;
	}
</style>
