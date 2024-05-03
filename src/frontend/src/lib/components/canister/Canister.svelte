<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import type {
		CanisterIcStatus,
		CanisterData,
		CanisterStatus,
		CanisterSyncStatus,
		Segment
	} from '$lib/types/canister';
	import type { PostMessageDataResponse } from '$lib/types/post-message';
	import { type CyclesWorker, initCyclesWorker } from '$lib/services/worker.cycles.services';
	import { onDestroy, onMount } from 'svelte';
	import { formatNumber } from '$lib/utils/number.utils';
	import { formatTCycles } from '$lib/utils/cycles.utils';
	import SkeletonText from '$lib/components/ui/SkeletonText.svelte';
	import { emit } from '$lib/utils/events.utils';
	import IconSync from '$lib/components/icons/IconSync.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import IconWarning from '$lib/components/icons/IconWarning.svelte';

	export let canisterId: Principal;
	export let segment: Segment;
	export let display = true;
	export let row = false;

	let canister: CanisterIcStatus | undefined = undefined;

	const syncCanister = ({ canister: c }: PostMessageDataResponse) => {
		canister = c as CanisterIcStatus;
		emit({ message: 'junoSyncCanister', detail: { canister } });
	};

	let worker: CyclesWorker | undefined;

	onMount(async () => (worker = await initCyclesWorker()));
	$: worker,
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

	export let data: CanisterData | undefined = undefined;
	export let sync: CanisterSyncStatus | undefined = undefined;

	$: ({ data, sync } = canister ?? { data: undefined, sync: undefined });

	let status: CanisterStatus | undefined;
	let memory_size: bigint;
	let cycles: bigint;

	let warning: boolean;
	$: warning = data?.warning?.cycles === true ?? false;

	$: ({ status, memory_size, cycles } = data?.canister ?? {
		status: undefined,
		memory_size: BigInt(0),
		cycles: BigInt(0),
		icp: 0,
		warning: false
	});
</script>

<svelte:window on:junoRestartCycles={restartCycles} />

{#if display}
	<div class:row>
		{#if ['synced', 'syncing'].includes(sync ?? '')}
			<p class="status">{status ?? '???'}</p>
			<p class="cycles">
				<span
					>{formatTCycles(cycles)}
					<small
						>T Cycles {#if warning}<IconWarning />{/if}</small
					></span
				>{#if sync === 'syncing'}<IconSync />{/if}
			</p>
			<p>
				{formatNumber(Number(memory_size) / 1_000_000)} MB <small>{$i18n.canisters.in_total}</small>
			</p>
		{:else if sync === 'loading'}
			<p><SkeletonText /></p>
			<p><SkeletonText /></p>
			<p><SkeletonText /></p>
		{/if}
	</div>
{/if}

<style lang="scss">
	p {
		font-size: var(--font-size-small);

		&:not(:last-of-type) {
			margin: 0 0 var(--padding-0_25x);
		}

		&::first-letter {
			text-transform: uppercase;
		}

		max-width: 300px;
		color: var(--value-color);
	}

	.cycles {
		display: inline-flex;
		gap: var(--padding);
	}

	.row {
		display: flex;
		gap: var(--padding-2x);

		p {
			margin: 0;
			position: relative;

			&:not(:last-of-type):after {
				content: '';
				border-right: 1px solid currentColor;

				display: block;
				height: 75%;

				position: absolute;
				top: 0;
				right: 0;
				transform: translate(var(--padding), 20%);
			}
		}
	}
</style>
