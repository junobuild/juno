<script lang="ts">
	import CanisterValue from '$lib/components/canister/CanisterValue.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { CanisterDataInfo, CanisterSyncStatus } from '$lib/types/canister';
	import { formatTCycles } from '$lib/utils/cycles.utils';

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
			{formatTCycles(cycles ?? 0n)}T <small>cycles</small>
		</span>
	</CanisterValue>
</div>

<style lang="scss">
	.balance {
		margin: 0 0 var(--padding-2_5x);
	}
</style>
