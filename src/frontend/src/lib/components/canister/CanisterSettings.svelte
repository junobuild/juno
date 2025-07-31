<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { isNullish, nonNullish } from '@dfinity/utils';
	import Canister from '$lib/components/canister/Canister.svelte';
	import CanisterValue from '$lib/components/canister/CanisterValue.svelte';
	import {
		FIVE_YEARS,
		ONE_MONTH,
		ONE_YEAR,
		THREE_MONTHS,
		SIX_MONTHS,
		TWO_YEARS
	} from '$lib/constants/canister.constants';
	import { i18n } from '$lib/stores/i18n.store';
	import { toasts } from '$lib/stores/toasts.store';
	import type {
		CanisterData,
		CanisterInfo,
		CanisterLogVisibility,
		CanisterSyncStatus,
		Segment
	} from '$lib/types/canister';
	import { formatTCycles } from '$lib/utils/cycles.utils';
	import { secondsToDuration } from '$lib/utils/date.utils';
	import { emit } from '$lib/utils/events.utils';
	import { formatBytes } from '$lib/utils/number.utils';

	interface Props {
		canisterId: Principal;
		segment: Segment;
		segmentLabel: string;
	}

	let { canisterId, segment, segmentLabel }: Props = $props();

	let data = $state<CanisterData | undefined>(undefined);
	let sync = $state<CanisterSyncStatus | undefined>(undefined);

	let settings = $derived(data?.canister?.settings);

	let freezingThreshold = $derived(settings?.freezingThreshold ?? 0n);

	let reservedCyclesLimit = $derived(settings?.reservedCyclesLimit);

	let logVisibility: CanisterLogVisibility | undefined = $derived(settings?.logVisibility);

	let wasmMemoryLimit = $derived(settings?.wasmMemoryLimit);

	let memoryAllocation = $derived(settings?.memoryAllocation);

	let computeAllocation = $derived(settings?.computeAllocation);

	const openModal = () => {
		if (isNullish(settings)) {
			toasts.error({ text: $i18n.errors.canister_settings_not_loaded });
			return;
		}

		if (isNullish(data)) {
			toasts.error({ text: $i18n.errors.canister_status });
			return;
		}

		const canister: CanisterInfo = {
			...data.canister,
			canisterId: canisterId.toText()
		};

		emit({
			message: 'junoModal',
			detail: {
				type: 'edit_canister_settings',
				detail: {
					canister,
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
	<span class="title">{$i18n.core.settings}</span>

	<div class="columns-3 fit-column-1">
		<div>
			<CanisterValue {sync}>
				{#snippet label()}
					{$i18n.canisters.freezing_threshold}
				{/snippet}
				<p>
					{#if freezingThreshold === BigInt(ONE_MONTH)}
						{$i18n.canisters.a_month}
					{:else if freezingThreshold === BigInt(THREE_MONTHS)}
						{$i18n.canisters.three_months}
					{:else if freezingThreshold === BigInt(SIX_MONTHS)}
						{$i18n.canisters.six_months}
					{:else if freezingThreshold === BigInt(ONE_YEAR)}
						{$i18n.canisters.a_year}
					{:else if freezingThreshold === BigInt(TWO_YEARS)}
						{$i18n.canisters.two_years}
					{:else if freezingThreshold === BigInt(FIVE_YEARS)}
						{$i18n.canisters.five_years}
					{:else}
						{secondsToDuration(freezingThreshold ?? 0n)}
					{/if}
				</p>
			</CanisterValue>

			<CanisterValue {sync}>
				{#snippet label()}
					{$i18n.canisters.reserved_cycles_limit}
				{/snippet}
				<p>{formatTCycles(reservedCyclesLimit ?? 0n)}T <small>cycles</small></p>
			</CanisterValue>

			<CanisterValue {sync}>
				{#snippet label()}
					{$i18n.canisters.log_visibility}
				{/snippet}
				<p class="log-visibility">{logVisibility ?? ''}</p>
			</CanisterValue>
		</div>

		<div>
			<CanisterValue {sync}>
				{#snippet label()}
					{$i18n.canisters.heap_memory_limit}
				{/snippet}
				<p>
					{nonNullish(wasmMemoryLimit) && wasmMemoryLimit > 0n
						? formatBytes(Number(wasmMemoryLimit))
						: $i18n.canisters.not_set}
				</p>
			</CanisterValue>

			<CanisterValue {sync}>
				{#snippet label()}
					{$i18n.canisters.memory_allocation}
				{/snippet}
				<p>
					{nonNullish(memoryAllocation) && memoryAllocation > 0n
						? formatBytes(Number(memoryAllocation))
						: $i18n.canisters.not_set}
				</p>
			</CanisterValue>

			<CanisterValue {sync}>
				{#snippet label()}
					{$i18n.canisters.compute_allocation}
				{/snippet}
				<p>
					{nonNullish(computeAllocation) && computeAllocation > 0n
						? `${computeAllocation}%`
						: $i18n.canisters.not_set}
				</p>
			</CanisterValue>
		</div>
	</div>
</div>

<Canister {canisterId} display={false} bind:data bind:sync />

<button onclick={openModal}>{$i18n.canisters.edit_settings}</button>

<style lang="scss">
	button {
		margin: 0 0 var(--padding-8x);
	}

	.log-visibility {
		text-transform: capitalize;
	}
</style>
