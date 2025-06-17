<script lang="ts">
	import CanisterSnapshotOption from '$lib/components/canister/CanisterSnapshotOption.svelte';
	import Collapsible from '$lib/components/ui/Collapsible.svelte';
	import { i18n } from '$lib/stores/i18n.store';

	interface Props {
		takeSnapshot: boolean;
	}

	let { takeSnapshot = $bindable(true) }: Props = $props();
</script>

<div class="container">
	<Collapsible>
		<svelte:fragment slot="header">{$i18n.core.advanced_options}</svelte:fragment>

		<CanisterSnapshotOption bind:takeSnapshot>
			{$i18n.canisters.snapshot_before_upgrade}
		</CanisterSnapshotOption>
	</Collapsible>
</div>

<style lang="scss">
	.container {
		margin: var(--padding-2x) 0 var(--padding-4x);
	}
</style>
