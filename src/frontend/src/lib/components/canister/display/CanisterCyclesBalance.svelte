<script lang="ts">
	import CanisterValue from '$lib/components/canister/CanisterValue.svelte';
	import CanisterTCycles from '$lib/components/canister/display/CanisterTCycles.svelte';
	import { i18n } from '$lib/stores/app/i18n.store';
	import type { CanisterDataInfo, CanisterSyncStatus } from '$lib/types/canister';

	interface Props {
		canister: CanisterDataInfo | undefined;
		sync: CanisterSyncStatus | undefined;
	}

	let { canister, sync }: Props = $props();

	let cycles = $derived(canister?.cycles);
</script>

<div class="balance">
	<CanisterValue {sync}>
		{#snippet label()}
			{$i18n.canisters.available_cycles}
		{/snippet}
		<span>
			<CanisterTCycles {cycles} />
		</span>
	</CanisterValue>
</div>

<style lang="scss">
	.balance {
		margin: 0 0 var(--padding-2_5x);
	}
</style>
