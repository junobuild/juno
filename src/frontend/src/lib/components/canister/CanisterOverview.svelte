<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import Canister from '$lib/components/canister/Canister.svelte';
	import CanisterCyclesBalance from '$lib/components/canister/CanisterCyclesBalance.svelte';
	import CanisterHealthCheck from '$lib/components/canister/CanisterHealthCheck.svelte';
	import CanisterMemory from '$lib/components/canister/CanisterMemory.svelte';
	import CanisterQueries from '$lib/components/canister/CanisterQueries.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { CanisterData, CanisterSyncStatus, Segment } from '$lib/types/canister';

	interface Props {
		canisterId: Principal;
		segment: Segment;
		heapWarningLabel?: string | undefined;
		data?: CanisterData | undefined;
		sync?: CanisterSyncStatus | undefined;
	}

	let {
		canisterId,
		segment,
		heapWarningLabel = undefined,
		data = $bindable(undefined),
		sync = $bindable(undefined)
	}: Props = $props();
</script>

<div>
	<div class="status">
		<Value>
			{#snippet label()}
				{$i18n.core.status}
			{/snippet}
			<Canister {canisterId} bind:data bind:sync displayMemoryTotal={false} displayCycles={false} />
		</Value>
	</div>

	<CanisterCyclesBalance canister={data?.canister} {sync} />

	<CanisterQueries canister={data?.canister} {sync} />
</div>

<div>
	<CanisterMemory
		canister={data?.canister}
		canisterData={data}
		{sync}
		{heapWarningLabel}
		{segment}
	/>
</div>

<div>
	<CanisterHealthCheck canister={data?.canister} {sync} />
</div>
