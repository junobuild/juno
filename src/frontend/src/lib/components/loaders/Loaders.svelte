<script lang="ts">
	import type { Snippet } from 'svelte';
	import MetadataLoader from '$lib/components/loaders/MetadataLoader.svelte';
	import SatellitesLoader from '$lib/components/loaders/SatellitesLoader.svelte';
	import WalletLoader from '$lib/components/loaders/WalletLoader.svelte';
	import { sortedSatellites } from '$lib/derived/satellites.derived';

	interface Props {
		children: Snippet;
		monitoring?: boolean;
	}

	let { children, monitoring }: Props = $props();
</script>

<WalletLoader>
	<SatellitesLoader>
		<MetadataLoader {monitoring} satellites={$sortedSatellites}>
			{@render children()}
		</MetadataLoader>
	</SatellitesLoader>
</WalletLoader>
