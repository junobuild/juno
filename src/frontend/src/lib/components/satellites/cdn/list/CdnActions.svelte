<script lang="ts">
	import type { SatelliteDid } from '$declarations';
	import CdnDelete from '$lib/components/satellites/cdn/list/CdnDelete.svelte';
	import CdnUpgrade from '$lib/components/satellites/cdn/list/CdnUpgrade.svelte';
	import type { Satellite } from '$lib/types/satellite';

	interface Props {
		asset: SatelliteDid.AssetNoContent;
		satellite: Satellite;
		reload: () => void;
	}

	let props: Props = $props();
</script>

<div class="tools">
	<CdnDelete {...props} />

	<CdnUpgrade {...props} />
</div>

<style lang="scss">
	.tools {
		display: flex;
		gap: var(--padding);
	}
</style>
