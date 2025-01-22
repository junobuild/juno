<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { debounce, isNullish } from '@dfinity/utils';
	import { onDestroy, onMount, type Snippet } from 'svelte';
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import { orbiterNotLoaded } from '$lib/derived/orbiter.derived';
	import { satellitesNotLoaded } from '$lib/derived/satellites.derived';
	import { type CyclesWorker, initCyclesWorker } from '$lib/services/worker.cycles.services';
	import { canisterSyncDataUncertifiedStore } from '$lib/stores/canister-sync-data.store';
	import type { CanisterSegment } from '$lib/types/canister';
	import type { PostMessageDataResponseCanisterSyncData } from '$lib/types/post-message';
	import { emit } from '$lib/utils/events.utils';

	interface Props {
		children: Snippet;
		satellites?: Satellite[];
		segments: CanisterSegment[];
	}

	let { children, segments }: Props = $props();

	let worker: CyclesWorker | undefined = $state(undefined);

	onMount(async () => (worker = await initCyclesWorker()));

	const syncCanister = ({ canister }: PostMessageDataResponseCanisterSyncData) => {
		if (isNullish(canister)) {
			return;
		}

		canisterSyncDataUncertifiedStore.set({
			canisterId: canister.id,
			data: {
				data: canister,
				certified: false
			}
		});

		// TODO: use store
		emit({ message: 'junoSyncCanister', detail: { canister } });
	};

	const debounceStart = debounce(() =>
		worker?.startCyclesTimer({
			segments,
			callback: syncCanister
		})
	);

	$effect(() => {
		worker?.stopCyclesTimer();

		if ($satellitesNotLoaded) {
			return;
		}

		if ($orbiterNotLoaded) {
			return;
		}

		if (segments.length === 0) {
			return;
		}

		debounceStart();
	});

	onDestroy(() => worker?.stopCyclesTimer());

	const restartCycles = ({ detail: { canisterId: _ } }: CustomEvent<{ canisterId: Principal }>) => {
		if (segments.length === 0) {
			return;
		}

		// TODO: we can potentially restart only the specified canister but, for now and simplicity reason, the worker just restart fully that's why we are passing all the segments.
		worker?.restartCyclesTimer(segments);
	};
</script>

<svelte:window onjunoRestartCycles={restartCycles} />

{@render children()}
