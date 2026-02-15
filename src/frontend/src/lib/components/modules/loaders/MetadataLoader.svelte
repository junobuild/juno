<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import type { Snippet } from 'svelte';
	import CanistersStatusLoader from '$lib/components/modules/loaders/CanistersStatusLoader.svelte';
	import RegistryLoader from '$lib/components/modules/loaders/RegistryLoader.svelte';
	import MonitoringLoader from '$lib/components/monitoring/loaders/MonitoringLoader.svelte';
	import NoMonitoringLoader from '$lib/components/monitoring/loaders/NoMonitoringLoader.svelte';
	import { missionControlId } from '$lib/derived/console/account.mission-control.derived';
	import { orbiter } from '$lib/derived/orbiter.derived';
	import type { CanisterSegment } from '$lib/types/canister';
	import type { Satellite } from '$lib/types/satellite';

	interface Props {
		children: Snippet;
		satellites?: Satellite[];
		monitoring?: boolean;
	}

	let { children, satellites = [], monitoring = false }: Props = $props();

	let segments: CanisterSegment[] = $derived([
		...(nonNullish($missionControlId)
			? [
					{
						canisterId: $missionControlId.toText(),
						segment: 'mission_control' as const
					}
				]
			: []),
		...(nonNullish($orbiter)
			? [
					{
						canisterId: $orbiter.orbiter_id.toText(),
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
