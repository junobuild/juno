<script lang="ts">
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import SegmentReload from '$lib/components/segments/SegmentReload.svelte';
	import { reloadSatelliteVersion } from '$lib/services/version/version.satellite.services.js';

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
