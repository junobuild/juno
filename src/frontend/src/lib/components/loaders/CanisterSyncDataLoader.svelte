<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { debounce, isNullish, nonNullish } from '@dfinity/utils';
	import { onDestroy, onMount, type Snippet } from 'svelte';
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import { missionControlIdDerived } from '$lib/derived/mission-control.derived';
	import { orbiterNotLoaded, orbiterStore } from '$lib/derived/orbiter.derived';
	import { satellitesNotLoaded } from '$lib/derived/satellites.derived';
	import { type CyclesWorker, initCyclesWorker } from '$lib/services/worker.cycles.services';
	import type { CanisterSegment } from '$lib/types/canister';
	import type {
		PostMessageDataResponseCanister,
		PostMessageDataResponseCanisterSyncData
	} from '$lib/types/post-message';
	import { canisterSyncDataUncertifiedStore } from '$lib/stores/canister-sync-data.store';
	import { emit } from '$lib/utils/events.utils';

	interface Props {
		children: Snippet;
		satellites?: Satellite[];
	}

	let { children, satellites = [] }: Props = $props();

	let segments: CanisterSegment[] = $derived([
		...(nonNullish($missionControlIdDerived)
			? [
					{
						canisterId: $missionControlIdDerived.toText(),
						segment: 'mission_control' as const
					}
				]
			: []),
		...(nonNullish($orbiterStore)
			? [
					{
						canisterId: $orbiterStore.orbiter_id.toText(),
						segment: 'orbiter' as const
					}
				]
			: []),
		...satellites.map(({ satellite_id }) => ({
			canisterId: satellite_id.toText(),
			segment: 'satellite' as const
		}))
	]);

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

	const restartCycles = ({ detail: { canisterId } }: CustomEvent<{ canisterId: Principal }>) => {
		const segment = segments.find(({ canisterId: cId }) => cId === canisterId.toText());

		if (isNullish(segment)) {
			return;
		}

		worker?.restartCyclesTimer([
			{
				canisterId: canisterId.toText(),
				segment: segment.segment
			}
		]);
	};
</script>

<svelte:window onjunoRestartCycles={restartCycles} />

{@render children()}
