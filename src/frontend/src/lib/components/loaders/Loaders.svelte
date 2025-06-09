<script lang="ts">
	import CanistersLoader from '$lib/components/loaders/CanistersLoader.svelte';
	import OrbitersLoader from '$lib/components/loaders/OrbitersLoader.svelte';
	import WalletLoader from '$lib/components/loaders/WalletLoader.svelte';
	import SatellitesLoader from '$lib/components/loaders/SatellitesLoader.svelte';
	import type { Snippet } from 'svelte';
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
			<CanistersLoader {monitoring} satellites={$sortedSatellites}>
				{@render children()}
			</CanistersLoader>
		</OrbitersLoader>
	</SatellitesLoader>
</WalletLoader>
