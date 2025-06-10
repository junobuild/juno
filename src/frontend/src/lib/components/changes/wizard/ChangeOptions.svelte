<script lang="ts">
	import CanisterSnapshotOption from '$lib/components/canister/CanisterSnapshotOption.svelte';
	import CheckboxInline from '$lib/components/ui/CheckboxInline.svelte';
	import Collapsible from '$lib/components/ui/Collapsible.svelte';
	import { i18n } from '$lib/stores/i18n.store';

	interface Props {
		clearProposalAssets: boolean;
		takeSnapshot?: boolean;
		withSnapshot?: boolean;
	}

	let {
		clearProposalAssets = $bindable(true),
		takeSnapshot = $bindable(false),
		withSnapshot = true
	}: Props = $props();
</script>

<div class="container">
	<Collapsible>
		<svelte:fragment slot="header">{$i18n.core.advanced_options}</svelte:fragment>

		<CheckboxInline bind:checked={clearProposalAssets}>
			{$i18n.changes.clear_after_apply}
		</CheckboxInline>

		{#if withSnapshot}
			<CanisterSnapshotOption bind:takeSnapshot>
				{$i18n.changes.snapshot_before_apply}
			</CanisterSnapshotOption>
		{/if}
	</Collapsible>
</div>

<style lang="scss">
	.container {
		margin: var(--padding-2x) 0 var(--padding-4x);
	}
</style>
