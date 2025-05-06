<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { nonNullish } from '@dfinity/utils';
	import CanisterValue from '$lib/components/canister/CanisterValue.svelte';
	import SnapshotsMemory from '$lib/components/snapshot/SnapshotsMemory.svelte';
	import InlineWarning from '$lib/components/ui/InlineWarning.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type { CanisterData, CanisterSyncStatus } from '$lib/types/canister';
	import { formatBytes } from '$lib/utils/number.utils.js';

	interface Props {
		canisterId: Principal;
		canisterData: CanisterData | undefined;
		sync: CanisterSyncStatus | undefined;
		heapWarningLabel?: string | undefined;
	}

	let { canisterId, canisterData, sync, heapWarningLabel }: Props = $props();

	let memory = $derived(canisterData?.memory);

	let warning = $derived(canisterData?.warning?.heap === true);
</script>

<CanisterValue {sync} rows={2}>
	{#snippet label()}
		{$i18n.canisters.memory}
	{/snippet}
	<p>
		{nonNullish(memory) ? formatBytes(Number(memory.heap)) : '???'}
		<small
			>{$i18n.canisters.on_heap}
			{#if warning}<InlineWarning title={heapWarningLabel} />{/if}</small
		>
	</p>
	<p>
		{nonNullish(memory) ? formatBytes(Number(memory.stable)) : '???'}
		<small>{$i18n.canisters.on_stable}</small>
	</p>
	<SnapshotsMemory {canisterId} />
</CanisterValue>

<style lang="scss">
	p {
		&:not(:last-of-type) {
			margin: 0 0 var(--padding-0_25x);
		}
	}
</style>
