<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import type { Snippet } from 'svelte';
	import CanistersStatusLoader from '$lib/components/loaders/CanistersStatusLoader.svelte';
	import MonitoringLoader from '$lib/components/loaders/MonitoringLoader.svelte';
	import NoMonitoringLoader from '$lib/components/loaders/NoMonitoringLoader.svelte';
	import RegistryLoader from '$lib/components/loaders/RegistryLoader.svelte';
	import { missionControlId } from '$lib/derived/console/account.mission-control.derived';
	import { orbiterStore } from '$lib/derived/orbiter.derived';
	import type { CanisterSegment } from '$lib/types/canister';
	import type { Satellite } from '$lib/types/satellite';
	import type { SegmentCanister } from '$lib/types/segment';

	interface Props {
		children: Snippet;
		satellites?: Satellite[];
		canisters?: SegmentCanister[];
		monitoring?: boolean;
	}

	let { children, satellites = [], canisters = [], monitoring = false }: Props = $props();

	let segments: CanisterSegment[] = $derived([
		...(nonNullish($missionControlId)
			? [
					{
						canisterId: $missionControlId.toText(),
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
		})),
		...canisters.map(({ canisterId }) => ({
			canisterId: canisterId.toText(),
			segment: 'canister' as const
		}))
	]);

	let CanistersMonitoringLoaderComponent = $derived(
		monitoring ? MonitoringLoader : NoMonitoringLoader
	);
</script>

<CanistersStatusLoader {segments}>
	<RegistryLoader {segments}>
		<CanistersMonitoringLoaderComponent {segments}>
			{@render children()}
		</CanistersMonitoringLoaderComponent>
	</RegistryLoader>
</CanistersStatusLoader>
