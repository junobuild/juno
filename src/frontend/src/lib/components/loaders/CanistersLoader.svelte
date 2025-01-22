<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import type { Snippet } from 'svelte';
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import CanisterSyncDataLoader from '$lib/components/loaders/CanisterSyncDataLoader.svelte';
	import { missionControlIdDerived } from '$lib/derived/mission-control.derived';
	import { orbiterStore } from '$lib/derived/orbiter.derived';
	import type { CanisterSegment } from '$lib/types/canister';

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
</script>

<CanisterSyncDataLoader {segments}>
	{@render children()}
</CanisterSyncDataLoader>
