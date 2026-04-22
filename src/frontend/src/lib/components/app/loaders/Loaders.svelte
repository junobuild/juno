<script lang="ts">
	import type { Snippet } from 'svelte';
	import MetadataLoader from '$lib/components/modules/loaders/MetadataLoader.svelte';
	import SegmentsLoader from '$lib/components/modules/loaders/SegmentsLoader.svelte';
	import NoSatelliteConfigLoader from '$lib/components/satellites/loaders/NoSatelliteConfigLoader.svelte';
	import SatelliteConfigLoader from '$lib/components/satellites/loaders/SatelliteConfigLoader.svelte';
	import WalletLoader from '$lib/components/wallet/loaders/WalletLoader.svelte';
	import { sortedSatellites } from '$lib/derived/satellites.derived';

	interface Props {
		children: Snippet;
		monitoring?: boolean;
		satelliteConfig?: boolean;
	}

	let { children, monitoring, satelliteConfig = false }: Props = $props();

	let SatelliteConfigLoaderComponent = $derived(
		satelliteConfig ? SatelliteConfigLoader : NoSatelliteConfigLoader
	);
</script>

<WalletLoader>
	<SegmentsLoader>
		<MetadataLoader {monitoring} satellites={$sortedSatellites}>
			<SatelliteConfigLoaderComponent>
				{@render children()}
			</SatelliteConfigLoaderComponent>
		</MetadataLoader>
	</SegmentsLoader>
</WalletLoader>
