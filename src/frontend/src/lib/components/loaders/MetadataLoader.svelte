<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import type { Snippet } from 'svelte';
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import MonitoringLoader from '$lib/components/loaders/MonitoringLoader.svelte';
	import NoMonitoringLoader from '$lib/components/loaders/NoMonitoringLoader.svelte';
	import CanistersStatusLoader from '$lib/components/loaders/CanistersStatusLoader.svelte';
	import { missionControlIdDerived } from '$lib/derived/mission-control.derived';
	import { orbiterStore } from '$lib/derived/orbiter.derived';
	import type { CanisterSegment } from '$lib/types/canister';
	import RegistryLoader from '$lib/components/loaders/RegistryLoader.svelte';

	interface Props {
		children: Snippet;
		satellites?: Satellite[];
		monitoring?: boolean;
	}

	let { children, satellites = [], monitoring = false }: Props = $props();

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
