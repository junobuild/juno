<script lang="ts">
	import Canister from '$lib/components/canister/Canister.svelte';
	import type { Principal } from '@dfinity/principal';
	import type {
		CanisterData,
		CanisterLogVisibility,
		CanisterSyncStatus,
		Segment
	} from '$lib/types/canister';
	import { i18n } from '$lib/stores/i18n.store';
	import { secondsToDuration } from '$lib/utils/date.utils';
	import CanisterValue from '$lib/components/canister/CanisterValue.svelte';
	import { formatTCycles } from '$lib/utils/cycles.utils';
	import { formatBytes } from '$lib/utils/number.utils';
	import { nonNullish } from '@dfinity/utils';

	export let canisterId: Principal;
	export let segment: Segment;

	let data: CanisterData | undefined;
	let sync: CanisterSyncStatus | undefined;

	let freezingThreshold: bigint | undefined;
	$: freezingThreshold = data?.canister?.settings?.freezingThreshold;

	let reservedCyclesLimit: bigint | undefined;
	$: reservedCyclesLimit = data?.canister?.settings?.reservedCyclesLimit;

	let logVisibility: CanisterLogVisibility | undefined;
	$: logVisibility = data?.canister?.settings?.logVisibility;

	let wasmMemoryLimit: bigint | undefined;
	$: wasmMemoryLimit = data?.canister?.settings?.wasmMemoryLimit;

	let memoryAllocation: bigint | undefined;
	$: memoryAllocation = data?.canister?.settings?.memoryAllocation;

	let computeAllocation: bigint | undefined;
	$: computeAllocation = data?.canister?.settings?.computeAllocation;
</script>

<div class="card-container with-title">
	<span class="title">{$i18n.canisters.parameters}</span>

	<div class="columns-3 fit-column-1">
		<div>
			<CanisterValue {sync}>
				<svelte:fragment slot="label">{$i18n.canisters.freezing_threshold}</svelte:fragment>
				<p>{secondsToDuration(freezingThreshold ?? 0n)}</p>
			</CanisterValue>

			<CanisterValue {sync}>
				<svelte:fragment slot="label">{$i18n.canisters.reserved_cycles_limit}</svelte:fragment>
				<p>{formatTCycles(reservedCyclesLimit ?? 0n)}T <small>cycles</small></p>
			</CanisterValue>

			<CanisterValue {sync}>
				<svelte:fragment slot="label">{$i18n.canisters.log_visibility}</svelte:fragment>
				<p class="log-visibility">{logVisibility ?? ''}</p>
			</CanisterValue>
		</div>

		<div>
			<CanisterValue {sync}>
				<svelte:fragment slot="label">{$i18n.canisters.wasm_memory_limit}</svelte:fragment>
				<p>
					{nonNullish(wasmMemoryLimit) && wasmMemoryLimit > 0n
						? formatBytes(Number(wasmMemoryLimit))
						: $i18n.canisters.not_set}
				</p>
			</CanisterValue>

			<CanisterValue {sync}>
				<svelte:fragment slot="label">{$i18n.canisters.memory_allocation}</svelte:fragment>
				<p>
					{nonNullish(memoryAllocation) && memoryAllocation > 0n
						? formatBytes(Number(memoryAllocation))
						: $i18n.canisters.not_set}
				</p>
			</CanisterValue>

			<CanisterValue {sync}>
				<svelte:fragment slot="label">{$i18n.canisters.compute_allocation}</svelte:fragment>
				<p>
					{nonNullish(computeAllocation) && computeAllocation > 0n
						? `${computeAllocation}%`
						: $i18n.canisters.not_set}
				</p>
			</CanisterValue>
		</div>
	</div>
</div>

<Canister {canisterId} {segment} bind:data bind:sync display={false} />

<style lang="scss">
	.card-container {
		margin: 0 0 var(--padding-8x);
	}

	.log-visibility {
		text-transform: capitalize;
	}
</style>
