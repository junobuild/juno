<script lang="ts">
	import type { Snippet } from 'svelte';
	import MetadataLoader from '$lib/components/modules/loaders/MetadataLoader.svelte';
	import SegmentsLoader from '$lib/components/modules/loaders/SegmentsLoader.svelte';
	import WalletLoader from '$lib/components/wallet/loaders/WalletLoader.svelte';
	import { sortedSatellites } from '$lib/derived/satellites.derived';

	interface Props {
		children: Snippet;
		monitoring?: boolean;
	}

	let { children, monitoring }: Props = $props();
</script>

<WalletLoader>
	<SegmentsLoader>
		<MetadataLoader {monitoring} satellites={$sortedSatellites}>
			{@render children()}
		</MetadataLoader>
	</SegmentsLoader>
</WalletLoader>
