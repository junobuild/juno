<script lang="ts">
	import type { MissionControlDid } from '$declarations';
	import SegmentReload from '$lib/components/segments/SegmentReload.svelte';
	import { reloadSatelliteVersion } from '$lib/services/version/version.satellite.services';

	interface Props {
		satellite: MissionControlDid.Satellite;
		onreload: () => void;
	}

	let { onreload, satellite }: Props = $props();

	const reloadVersion = async () => {
		onreload();

		await reloadSatelliteVersion({ satelliteId: satellite.satellite_id });
	};
</script>

<SegmentReload {reloadVersion} />
