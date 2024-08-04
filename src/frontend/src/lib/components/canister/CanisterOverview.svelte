<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { i18n } from '$lib/stores/i18n.store';
	import Value from '$lib/components/ui/Value.svelte';
	import Canister from '$lib/components/canister/Canister.svelte';
	import type { CanisterData, CanisterSyncStatus, Segment } from '$lib/types/canister';
	import { formatTCycles } from '$lib/utils/cycles.utils';
	import type { MemorySize } from '$declarations/satellite/satellite.did';
	import { nonNullish } from '@dfinity/utils';
	import { formatBytes, formatNumber } from '$lib/utils/number.utils';
	import IconWarning from '$lib/components/icons/IconWarning.svelte';
	import CanisterValue from '$lib/components/canister/CanisterValue.svelte';

	export let canisterId: Principal;
	export let segment: Segment;
	export let heapWarningLabel: string | undefined = undefined;

	let data: CanisterData | undefined;
	let sync: CanisterSyncStatus | undefined;

	let idleCyclesBurnedPerDay: bigint | undefined;
	$: idleCyclesBurnedPerDay = data?.canister?.idleCyclesBurnedPerDay;

	let numInstructionsTotal: bigint | undefined;
	$: numInstructionsTotal = data?.canister?.queryStats?.numInstructionsTotal;

	let numCallsTotal: bigint | undefined;
	$: numCallsTotal = data?.canister?.queryStats?.numCallsTotal;

	let responsePayloadBytesTotal: bigint | undefined;
	$: responsePayloadBytesTotal = data?.canister?.queryStats?.responsePayloadBytesTotal;

	let requestPayloadBytesTotal: bigint | undefined;
	$: requestPayloadBytesTotal = data?.canister?.queryStats?.requestPayloadBytesTotal;

	let memory: MemorySize | undefined;
	$: memory = data?.memory;

	let warning: boolean;
	$: warning = data?.warning?.heap === true ?? false;
</script>

<div>
	<div class="status">
		<Value>
			<svelte:fragment slot="label">{$i18n.core.status}</svelte:fragment>
			<Canister {canisterId} {segment} bind:data bind:sync />
		</Value>
	</div>

	{#if ['satellite', 'orbiter'].includes(segment)}
		<CanisterValue {sync} rows={2}>
			<svelte:fragment slot="label">{$i18n.canisters.memory}</svelte:fragment>
			<p>
				{nonNullish(memory) ? formatBytes(Number(memory.heap)) : '???'}
				<small
					>{$i18n.canisters.on_heap}
					{#if warning}<span class="warning" title={heapWarningLabel}><IconWarning /></span
						>{/if}</small
				>
			</p>
			<p>
				{nonNullish(memory) ? formatBytes(Number(memory.stable)) : '???'}
				<small>{$i18n.canisters.on_stable}</small>
			</p>
		</CanisterValue>
	{/if}
</div>

<div>
	<div class="queries">
		<CanisterValue {sync} rows={4}>
			<svelte:fragment slot="label">{$i18n.canisters.queries}</svelte:fragment>

			<p>
				{nonNullish(numCallsTotal)
					? formatNumber(Number(numCallsTotal), {
							minFraction: 0,
							maxFraction: 0,
							notation: 'compact'
						})
					: '???'} <small>{$i18n.canisters.calls}</small>
			</p>
			<p>
				{nonNullish(numInstructionsTotal)
					? formatNumber(Number(numInstructionsTotal), {
							minFraction: 0,
							maxFraction: 0,
							notation: 'compact'
						})
					: '???'}
				<small>{$i18n.canisters.instructions}</small>
			</p>
			<p>
				{nonNullish(requestPayloadBytesTotal)
					? formatBytes(Number(requestPayloadBytesTotal))
					: '???'}
				<small>{$i18n.canisters.requests}</small>
			</p>
			<p>
				{nonNullish(responsePayloadBytesTotal)
					? formatBytes(Number(responsePayloadBytesTotal))
					: '???'}
				<small>{$i18n.canisters.responses}</small>
			</p>
		</CanisterValue>
	</div>

	<div class="consumption">
		<CanisterValue {sync}>
			<svelte:fragment slot="label">{$i18n.canisters.daily_consumption}</svelte:fragment>
			<p>
				{formatTCycles(idleCyclesBurnedPerDay ?? 0n)}T <small>cycles</small>
			</p>
		</CanisterValue>
	</div>
</div>

<style lang="scss">
	@use '../../styles/mixins/media';

	p {
		max-width: 300px;
		color: var(--value-color);

		&:not(:last-of-type) {
			margin: 0 0 var(--padding-0_25x);
		}
	}

	.status {
		min-height: calc(100px + var(--padding-2_5x));
		min-width: 170px;
	}

	.queries {
		min-height: calc(126px + var(--padding-2_5x));
	}

	.consumption {
		min-height: calc(48px + var(--padding-2_5x));
	}

	.warning {
		color: #f37010;
	}

	@include media.dark-theme {
		.warning {
			color: var(--color-warning);
		}
	}
</style>
