<script lang="ts">
	import type { Snippet } from 'svelte';
	import MetadataLoader from '$lib/components/loaders/MetadataLoader.svelte';
	import OrbitersLoader from '$lib/components/loaders/OrbitersLoader.svelte';
	import SatellitesLoader from '$lib/components/loaders/SatellitesLoader.svelte';
	import WalletLoader from '$lib/components/loaders/WalletLoader.svelte';
	import { sortedSatellites } from '$lib/derived/satellites.derived';

	interface Props {
		children: Snippet;
		withOrbiterVersion?: boolean;
		monitoring?: boolean;
	}

	let { children, withOrbiterVersion, monitoring }: Props = $props();
</script>

<WalletLoader>
	<SatellitesLoader>
		<OrbitersLoader withVersion={withOrbiterVersion}>
			<MetadataLoader {monitoring} satellites={$sortedSatellites}>
				{@render children()}
			</MetadataLoader>
		</OrbitersLoader>
	</SatellitesLoader>
</WalletLoader>
