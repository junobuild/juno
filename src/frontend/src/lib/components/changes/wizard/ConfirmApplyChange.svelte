<script lang="ts">
	import type { ProposalType } from '@junobuild/cdn';
	import ChangeOptions from '$lib/components/changes/wizard/ChangeOptions.svelte';
	import Html from '$lib/components/ui/Html.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { i18nFormat } from '$lib/utils/i18n.utils';

	interface Props {
		proposalId: bigint;
		proposalHash: string | undefined;
		proposalType: ProposalType;
		proposalClearExistingAssets: boolean;
		clearProposalAssets: boolean;
		takeSnapshot: boolean;
		onclose: () => void;
		onsubmit: ($event: SubmitEvent) => Promise<void>;
	}

	let {
		clearProposalAssets = $bindable(true),
		takeSnapshot = $bindable(false),
		onclose,
		onsubmit,
		proposalId,
		proposalHash,
		proposalType,
		proposalClearExistingAssets
	}: Props = $props();

	let label = $derived(
		'AssetsUpgrade' in proposalType
			? $i18n.changes.confirm_assets_upgrade
			: $i18n.changes.confirm_segments_deployment
	);
</script>

<h2>{$i18n.changes.apply_change}</h2>

<form {onsubmit}>
	<p>
		<Html
			text={i18nFormat(label, [
				{
					placeholder: '{0}',
					value: `${proposalId}`
				},
				{
					placeholder: '{1}',
					value: proposalHash ?? ''
				}
			])}
		/>
	</p>

	{#if proposalClearExistingAssets}
		<p>{$i18n.changes.clear_existing_assets}</p>
	{/if}

	<ChangeOptions bind:takeSnapshot bind:clearProposalAssets />

	<div class="toolbar">
		<button onclick={onclose} type="button">{$i18n.core.cancel}</button>
		<button type="submit">{$i18n.core.apply}</button>
	</div>
</form>

<style lang="scss">
	form {
		:global(code) {
			word-break: break-word;
		}
	}
</style>
