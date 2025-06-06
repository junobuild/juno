<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import {
		loadMissionControlVersion,
		loadSatelliteVersion
	} from '$lib/services/version.loader.services';
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
			loadSatelliteVersion({
				satelliteId: satellite.satellite_id,
				missionControlId,
				skipReload: skipSatelliteReload,
				identity: $authStore.identity
			}),
			loadMissionControlVersion({
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
