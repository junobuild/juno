<script lang="ts">
	import { reloadSatelliteVersion } from '$lib/services/version/version.satellite.services.js';
	import SegmentReload from '$lib/components/segments/SegmentReload.svelte';
	import type { Satellite } from '$declarations/mission_control/mission_control.did';

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
