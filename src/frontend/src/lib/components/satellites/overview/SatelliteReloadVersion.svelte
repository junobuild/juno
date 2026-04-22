<script lang="ts">
	import SegmentReload from '$lib/components/modules/segments/SegmentReload.svelte';
	import { reloadSatelliteVersion } from '$lib/services/version/version.satellite.services';
	import type { Satellite } from '$lib/types/satellite';

	interface Props {
		satellite: Satellite;
		onreload: () => void;
	}

	let { onreload, satellite }: Props = $props();

	const reloadVersion = async () => {
		onreload();

		await reloadSatelliteVersion({ satelliteId: satellite.satellite_id });
	};
</script>

<SegmentReload {reloadVersion} />
