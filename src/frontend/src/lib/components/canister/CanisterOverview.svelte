<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { i18n } from '$lib/stores/i18n.store';
	import Value from '$lib/components/ui/Value.svelte';
	import Canister from '$lib/components/canister/Canister.svelte';
	import type { CanisterData, CanisterSyncStatus, Segment } from '$lib/types/canister';
	import { formatTCycles } from '$lib/utils/cycles.utils';
	import SkeletonText from '$lib/components/ui/SkeletonText.svelte';
	import type { MemorySize } from '$declarations/satellite/satellite.did';
	import { isNullish, nonNullish } from '@dfinity/utils';
	import { formatNumber } from '$lib/utils/number.utils';

	export let canisterId: Principal;
	export let segment: Segment;

	let data: CanisterData | undefined;
	let sync: CanisterSyncStatus | undefined;

	let idle_cycles_burned_per_day: bigint | undefined;
	$: idle_cycles_burned_per_day = data?.canister?.idle_cycles_burned_per_day;

	let memory: MemorySize | undefined;
	$: memory = data?.memory;
</script>

<div class="status">
	<Value>
		<svelte:fragment slot="label">{$i18n.core.status}</svelte:fragment>
		<Canister {canisterId} {segment} bind:data bind:sync />
	</Value>
</div>

<div class="consumption">
	<Value>
		<svelte:fragment slot="label">{$i18n.canisters.daily_consumption}</svelte:fragment>
		{#if ['synced', 'syncing'].includes(sync ?? '')}
			<p>
				{formatTCycles(idle_cycles_burned_per_day ?? 0n)} T Cycles
			</p>
		{:else if sync === 'loading'}
			<p><SkeletonText /></p>
		{/if}
	</Value>
</div>

{#if segment === 'satellite'}
	<Value>
		<svelte:fragment slot="label">{$i18n.satellites.memory}</svelte:fragment>
		{#if nonNullish(memory)}
			<p>Heap {formatNumber(Number(memory.heap) / 1_000_000)} MB</p>
			<p>Stable {formatNumber(Number(memory.stable) / 1_000_000)} MB</p>
		{:else if isNullish(sync) || ['loading', 'syncing'].includes(sync ?? '')}
			<p><SkeletonText /></p>
			<p><SkeletonText /></p>
		{:else if sync !== 'synced'}
			<p>Heap ???</p>
			<p>Stable ???</p>
		{/if}
	</Value>
{/if}

<style lang="scss">
	p {
		&:not(:last-of-type) {
			margin: 0 0 var(--padding-0_25x);
		}

		max-width: 300px;
		color: var(--value-color);
	}

	.status {
		min-height: calc(100px + var(--padding-2_5x));
	}

	.consumption {
		min-height: calc(48px + var(--padding-2_5x));
	}
</style>
