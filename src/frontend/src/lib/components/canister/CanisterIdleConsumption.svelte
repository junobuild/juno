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

	let idleCyclesBurnedPerDay: bigint | undefined = $derived(canister?.idleCyclesBurnedPerDay);
</script>

<div class="consumption">
	<CanisterValue {sync}>
		{#snippet label()}
			{$i18n.canisters.daily_consumption}
		{/snippet}
		<span>
			<CanisterTCycles cycles={idleCyclesBurnedPerDay} />
		</span>
	</CanisterValue>
</div>

<style lang="scss">
	.consumption {
		margin: 0 0 var(--padding-2_5x);
	}
</style>
