<script lang="ts">
	import CanisterValue from '$lib/components/canister/CanisterValue.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { CanisterDataInfo, CanisterSyncStatus } from '$lib/types/canister';
	import { formatTCycles } from '$lib/utils/cycles.utils.js';

	interface Props {
		canister: CanisterDataInfo | undefined;
		sync: CanisterSyncStatus | undefined;
	}

	let { canister, sync }: Props = $props();

	let idleCyclesBurnedPerDay: bigint | undefined = $derived(canister?.idleCyclesBurnedPerDay);
</script>

<div class="consumption">
	<CanisterValue {sync}>
		{#snippet label()}
			{$i18n.canisters.daily_consumption}
		{/snippet}
		<span>
			{formatTCycles(idleCyclesBurnedPerDay ?? 0n)}T <small>cycles</small>
		</span>
	</CanisterValue>
</div>

<style lang="scss">
	.consumption {
		margin: 0 0 var(--padding-2_5x);
	}
</style>
