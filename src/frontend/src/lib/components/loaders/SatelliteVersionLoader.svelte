<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import { reloadMissionControlVersion } from '$lib/services/version/version.mission-control.services';
	import { reloadSatelliteVersion } from '$lib/services/version/version.satellite.services';
	import { authStore } from '$lib/stores/auth.store';
	import type { MissionControlId } from '$lib/types/mission-control';

	interface Props {
		missionControlId: MissionControlId;
		satellite: Satellite;
		children: Snippet;
	}

	let { missionControlId, satellite, children }: Props = $props();

	const load = async (skipSatelliteReload: boolean) => {
		await Promise.allSettled([
			reloadSatelliteVersion({
				satelliteId: satellite.satellite_id,
				missionControlId,
				skipReload: skipSatelliteReload,
				identity: $authStore.identity
			}),
			reloadMissionControlVersion({
				missionControlId,
				skipReload: true,
				identity: $authStore.identity
			})
		]);
	};

	onMount(() => {
		load(true);
	});
</script>

<svelte:window onjunoReloadVersions={async () => await load(false)} />

{@render children()}
