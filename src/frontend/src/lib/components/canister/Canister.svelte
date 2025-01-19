<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { onDestroy, onMount } from 'svelte';
	import { run } from 'svelte/legacy';
	import CanisterIndicator from '$lib/components/canister/CanisterIndicator.svelte';
	import CanisterTCycles from '$lib/components/canister/CanisterTCycles.svelte';
	import SkeletonText from '$lib/components/ui/SkeletonText.svelte';
	import { type CyclesWorker, initCyclesWorker } from '$lib/services/worker.cycles.services';
	import { i18n } from '$lib/stores/i18n.store';
	import type {
		CanisterSyncData,
		CanisterData,
		CanisterSyncStatus,
		Segment
	} from '$lib/types/canister';
	import type { PostMessageDataResponseCanister } from '$lib/types/post-message';
	import { emit } from '$lib/utils/events.utils';
	import { formatBytes } from '$lib/utils/number.utils';

	interface Props {
		canisterId: Principal;
		segment: Segment;
		display?: boolean;
		row?: boolean;
		data?: CanisterData | undefined;
		sync?: CanisterSyncStatus | undefined;
	}

	let {
		canisterId,
		segment,
		display = true,
		row = false,
		data = $bindable(undefined),
		sync = $bindable(undefined)
	}: Props = $props();

	let canister: CanisterSyncData | undefined = $state(undefined);

	const syncCanister = ({ canister: c }: PostMessageDataResponseCanister) => {
		canister = c as CanisterSyncData;
		emit({ message: 'junoSyncCanister', detail: { canister } });
	};

	let worker: CyclesWorker | undefined = $state(undefined);

	onMount(async () => (worker = await initCyclesWorker()));

	run(() => {
		// @ts-expect-error TODO: to be migrated to Svelte v5
		worker,
			canisterId,
			(() =>
				worker?.startCyclesTimer({
					segments: [
						{
							canisterId: canisterId.toText(),
							segment
						}
					],
					callback: syncCanister
				}))();
	});

	onDestroy(() => worker?.stopCyclesTimer());

	const restartCycles = ({
		detail: { canisterId: syncCanisterId }
	}: CustomEvent<{ canisterId: Principal }>) => {
		if (syncCanisterId.toText() !== canisterId.toText()) {
			return;
		}

		worker?.restartCyclesTimer([
			{
				canisterId: canisterId.toText(),
				segment
			}
		]);
	};

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

<svelte:window onjunoRestartCycles={restartCycles} />

{#if display}
	<div class:row>
		{#if ['synced', 'syncing'].includes(sync ?? '')}
			<p class="status"><CanisterIndicator {data} {sync} /><span>{status ?? '???'}</span></p>
			<p class="cycles">
				<CanisterTCycles {data} />
			</p>
			<p>
				{formatBytes(Number(memorySize))} <small>{$i18n.canisters.in_total}</small>
			</p>
		{:else if sync === 'loading'}
			<p class="skeleton"><SkeletonText /></p>
			<p class="skeleton"><SkeletonText /></p>
			<p class="skeleton"><SkeletonText /></p>
		{/if}
	</div>
{/if}

<style lang="scss">
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
		display: flex;
		gap: var(--padding-2x);

		p {
			margin: 0;
			position: relative;

			font-size: var(--font-size-small);

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

	.skeleton {
		:global(.skeleton-text) {
			margin: 0;
		}

		:global(span) {
			line-height: var(--line-height-standard);
		}
	}
</style>
