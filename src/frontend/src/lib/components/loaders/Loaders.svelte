<script lang="ts">
	import type { Snippet } from 'svelte';
	import MetadataLoader from '$lib/components/loaders/MetadataLoader.svelte';
	import SegmentsLoader from '$lib/components/loaders/SegmentsLoader.svelte';
	import WalletLoader from '$lib/components/loaders/WalletLoader.svelte';
	import { consoleCanisters } from '$lib/derived/console/segments.derived';
	import { sortedSatellites } from '$lib/derived/satellites.derived';

	interface Props {
		children: Snippet;
		monitoring?: boolean;
	}

	let { children, monitoring }: Props = $props();
</script>

<WalletLoader>
	<SegmentsLoader>
		<MetadataLoader canisters={$consoleCanisters} {monitoring} satellites={$sortedSatellites}>
			{@render children()}
		</MetadataLoader>
	</SegmentsLoader>
</WalletLoader>
