<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import Canister from '$lib/components/canister/Canister.svelte';
	import CanisterDailyConsumption from '$lib/components/canister/CanisterDailyConsumption.svelte';
	import CanisterMemory from '$lib/components/canister/CanisterMemory.svelte';
	import CanisterQueries from '$lib/components/canister/CanisterQueries.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { CanisterData, CanisterSyncStatus, Segment } from '$lib/types/canister';

	interface Props {
		canisterId: Principal;
		segment: Segment;
		heapWarningLabel?: string | undefined;
	}

	let { canisterId, segment, heapWarningLabel = undefined }: Props = $props();

	let data: CanisterData | undefined = $state();
	let sync: CanisterSyncStatus | undefined = $state();
</script>

<div>
	<div class="status">
		<Value>
			{#snippet label()}
				{$i18n.core.status}
			{/snippet}
			<Canister {canisterId} bind:data bind:sync displayMemoryTotal={false} />
		</Value>
	</div>

	<CanisterDailyConsumption canister={data?.canister} {sync} />

	<CanisterQueries canister={data?.canister} {sync} />
</div>

<div>
	<CanisterMemory
		{canisterId}
		canister={data?.canister}
		canisterData={data}
		{sync}
		{heapWarningLabel}
		{segment}
	/>
</div>

<style lang="scss">
	.status {
		min-height: calc(78px + var(--padding-2_5x));
		min-width: 170px;
	}
</style>
