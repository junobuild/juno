<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import type {
		Canister,
		CanisterData,
		CanisterStatus,
		CanisterSyncStatus
	} from '$lib/types/canister';
	import type { PostMessageDataResponse } from '$lib/types/post-message';
	import { type CyclesCallback, initCyclesWorker } from '$lib/services/worker.cycles.services';
	import { onDestroy, onMount } from 'svelte';
	import { formatNumber } from '$lib/utils/number.utils';
	import { formatICP } from '$lib/utils/icp.utils';
	import { formatTCycles } from '$lib/utils/cycles.utils';
	import SkeletonText from '$lib/components/ui/SkeletonText.svelte';
	import { emit } from '$lib/utils/events.utils';

	export let canisterId: Principal;
	export let display = true;

	let canister: Canister | undefined = undefined;

	const syncCanister = ({ canister: c }: PostMessageDataResponse) => {
		canister = c;
		emit({ message: 'junoSyncCanister', detail: { canister } });
	};

	let worker:
		| {
				startCyclesTimer: (params: { canisterIds: string[]; callback: CyclesCallback }) => void;
				stopCyclesTimer: () => void;
		  }
		| undefined;

	onMount(async () => (worker = await initCyclesWorker()));
	$: worker,
		canisterId,
		(() =>
			worker?.startCyclesTimer({ canisterIds: [canisterId.toText()], callback: syncCanister }))();

	onDestroy(() => worker?.stopCyclesTimer());

	let data: CanisterData | undefined;
	let sync: CanisterSyncStatus = 'syncing';

	$: ({ data, sync } = canister ?? { data: undefined, sync: 'syncing' });

	let status: CanisterStatus | undefined;
	let memory_size: bigint;
	let cycles: bigint;
	let icp: number;
	let warning: boolean;

	$: ({ status, memory_size, cycles, icp, warning } = data ?? {
		status: undefined,
		memory_size: BigInt(0),
		cycles: BigInt(0),
		icp: 0,
		warning: false
	});
</script>

{#if display}
	{#if sync === 'synced'}
		<p>
			{formatTCycles(cycles)} T Cycles {#if warning}⚠️{/if}
		</p>

		<p class="status">{status ?? '???'}</p>
		<p>{formatNumber(Number(memory_size) / 1_000_000)} MB</p>
	{:else if sync === 'syncing'}
		<p><SkeletonText /></p>
		<p><SkeletonText /></p>
		<p><SkeletonText /></p>
	{/if}
{/if}

<style lang="scss">
	p {
		&:not(:last-of-type) {
			margin: 0 0 var(--padding-0_25x);
		}

		&::first-letter {
			text-transform: uppercase;
		}

		max-width: 300px;
		color: var(--value-color);
	}
</style>
