<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { debounce } from '@dfinity/utils';
	import { onDestroy, onMount, type Snippet } from 'svelte';
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import { orbiterNotLoaded } from '$lib/derived/orbiter.derived';
	import { satellitesNotLoaded } from '$lib/derived/satellites.derived';
	import { CyclesWorker } from '$lib/services/workers/worker.cycles.services';
	import type { CanisterSegment } from '$lib/types/canister';

	interface Props {
		children: Snippet;
		satellites?: Satellite[];
		segments: CanisterSegment[];
	}

	let { children, segments, satellites: _ }: Props = $props();

	let worker = $state<CyclesWorker | undefined>(undefined);

	onMount(async () => (worker = await CyclesWorker.init()));
	onDestroy(() => worker?.terminate());

	const debounceStart = debounce(() =>
		worker?.startCyclesTimer({
			segments
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
