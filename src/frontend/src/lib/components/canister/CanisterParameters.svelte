<script lang="ts">
	import Canister from '$lib/components/canister/Canister.svelte';
	import type { Principal } from '@dfinity/principal';
	import type {
		CanisterData,
		CanisterLogVisibility,
		CanisterSettings,
		CanisterSyncStatus,
		Segment
	} from '$lib/types/canister';
	import { i18n } from '$lib/stores/i18n.store';
	import { secondsToDuration } from '$lib/utils/date.utils';
	import CanisterValue from '$lib/components/canister/CanisterValue.svelte';
	import { formatTCycles } from '$lib/utils/cycles.utils';
	import { formatBytes } from '$lib/utils/number.utils';
	import { isNullish, nonNullish } from '@dfinity/utils';
	import { emit } from '$lib/utils/events.utils';
	import { toasts } from '$lib/stores/toasts.store';

	export let canisterId: Principal;
	export let segment: Segment;
	export let segmentLabel: string;

	let data: CanisterData | undefined;
	let sync: CanisterSyncStatus | undefined;

	let settings: CanisterSettings | undefined;
	$: settings = data?.canister?.settings;

	let freezingThreshold: bigint | undefined;
	$: freezingThreshold = settings?.freezingThreshold;

	let reservedCyclesLimit: bigint | undefined;
	$: reservedCyclesLimit = settings?.reservedCyclesLimit;

	let logVisibility: CanisterLogVisibility | undefined;
	$: logVisibility = settings?.logVisibility;

	let wasmMemoryLimit: bigint | undefined;
	$: wasmMemoryLimit = settings?.wasmMemoryLimit;

	let memoryAllocation: bigint | undefined;
	$: memoryAllocation = settings?.memoryAllocation;

	let computeAllocation: bigint | undefined;
	$: computeAllocation = settings?.computeAllocation;

	const openModal = () => {
		if (isNullish(settings)) {
			toasts.error({ text: $i18n.errors.canister_settings_no_loaded });
			return;
		}

		emit({
			message: 'junoModal',
			detail: {
				type: 'edit_canister_settings',
				detail: {
					segment: {
						canisterId: canisterId.toText(),
						segment,
						label: segmentLabel
					},
					settings
				}
			}
		});
	};
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

<button on:click={openModal}>{$i18n.canisters.edit_parameters}</button>

<style lang="scss">
	button {
		margin: 0 0 var(--padding-8x);
	}

	.log-visibility {
		text-transform: capitalize;
	}
</style>
