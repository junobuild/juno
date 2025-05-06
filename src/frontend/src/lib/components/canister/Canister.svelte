<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import CanisterIndicator from '$lib/components/canister/CanisterIndicator.svelte';
	import CanisterSyncData from '$lib/components/canister/CanisterSyncData.svelte';
	import CanisterTCycles from '$lib/components/canister/CanisterTCycles.svelte';
	import SkeletonText from '$lib/components/ui/SkeletonText.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import type {
		CanisterSyncData as CanisterSyncDataType,
		CanisterData,
		CanisterSyncStatus
	} from '$lib/types/canister';
	import { formatBytes } from '$lib/utils/number.utils';

	interface Props {
		canisterId: Principal;
		display?: boolean;
		displayMemoryTotal?: boolean;
		row?: boolean;
		data?: CanisterData | undefined;
		sync?: CanisterSyncStatus | undefined;
	}

	let {
		canisterId,
		display = true,
		displayMemoryTotal = true,
		row = false,
		data = $bindable(undefined),
		sync = $bindable(undefined)
	}: Props = $props();

	let canister = $state<CanisterSyncDataType | undefined>(undefined);

	$effect(() => {
		const c = canister ?? { data: undefined, sync: undefined };
		data = c?.data;
		sync = c?.sync;
	});

	let { status, memorySize } = $derived(
		data?.canister ?? {
			status: undefined,
			memorySize: BigInt(0),
			cycles: BigInt(0),
			icp: 0,
			warning: false
		}
	);
</script>

<CanisterSyncData {canisterId} bind:canister />

{#if display}
	<div class:row>
		{#if ['synced', 'syncing'].includes(sync ?? '')}
			<p class="status"><CanisterIndicator {data} /><span>{status ?? '???'}</span></p>
			<p class="cycles">
				<CanisterTCycles {data} />
			</p>
			{#if displayMemoryTotal}
				<p>
					{formatBytes(Number(memorySize))} <small>{$i18n.canisters.in_total}</small>
				</p>
			{/if}
		{:else if sync === 'loading'}
			<p class="skeleton"><SkeletonText /></p>
			<p class="skeleton"><SkeletonText /></p>
			{#if displayMemoryTotal}
				<p class="skeleton"><SkeletonText /></p>
			{/if}
		{/if}
	</div>
{/if}

<style lang="scss">
	@use '../../styles/mixins/media';

	p {
		max-width: 300px;
		color: var(--value-color);

		&:not(:last-of-type) {
			margin: 0 0 var(--padding-0_25x);
		}

		&::first-letter,
		span::first-letter {
			text-transform: uppercase;
		}
	}

	.cycles {
		display: inline-flex;
		gap: var(--padding);
	}

	.status {
		display: flex;
		align-items: center;
		gap: var(--padding);
	}

	.row {
		font-size: var(--font-size-small);

		@include media.min-width(large) {
			display: flex;
			gap: var(--padding-2x);

			p {
				margin: 0;
				position: relative;

				min-width: var(--padding-8x);
				--skeleton-text-padding: 0;

				&:not(:last-of-type):after {
					content: '';
					border-right: 1px solid currentColor;

					display: block;
					height: 75%;

					position: absolute;
					top: 0;
					right: 0;
					transform: translate(var(--padding), 20%) rotate(15deg);
				}
			}
		}
	}

	.skeleton {
		:global(.skeleton-text) {
			margin: 0;
		}

		:global(span) {
			line-height: var(--line-height-standard);
		}
	}
</style>
