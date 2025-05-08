<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import Canister from '$lib/components/canister/Canister.svelte';
	import CanisterMemory from '$lib/components/canister/CanisterMemory.svelte';
	import CanisterQueries from '$lib/components/canister/CanisterQueries.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { CanisterData, CanisterSyncStatus, Segment } from '$lib/types/canister';
	import CanisterFreezingThreshold from '$lib/components/canister/CanisterFreezingThreshold.svelte';

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
			<Canister {canisterId} bind:data bind:sync displayMemoryTotal={false} displayCycles={false} />
		</Value>
	</div>

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
	<CanisterFreezingThreshold canister={data?.canister} {sync} />
</div>

<style lang="scss">
	.status {
		min-height: calc(38px + var(--padding-2_5x));
	}
</style>
