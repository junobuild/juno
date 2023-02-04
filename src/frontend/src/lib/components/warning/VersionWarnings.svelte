<script lang="ts">
	import { versionStore } from '$lib/stores/version.store';
	import { nonNullish } from '$lib/utils/utils';
	import IconNewReleases from '$lib/components/icons/IconNewReleases.svelte';
	import { loadVersion } from '$lib/services/console.services';
	import { missionControlStore } from '$lib/stores/mission-control.store';
	import { satelliteStore } from '$lib/stores/satellite.store';

	const load = async () =>
		await loadVersion({
			satelliteId: $satelliteStore?.satellite_id,
			missionControlId: $missionControlStore
		});

	$: $missionControlStore, $satelliteStore, (async () => await load())();

	let satVersion: string | undefined;
	let satRelease: string | undefined;

	let ctrlVersion: string | undefined;
	let ctrlRelease: string | undefined;

	$: satVersion = $versionStore?.satellite?.current;
	$: satRelease = $versionStore?.satellite?.release;

	$: ctrlVersion = $versionStore?.missionControl.current;
	$: ctrlRelease = $versionStore?.missionControl.release;

	let satReady = false;
	$: satReady = nonNullish($versionStore) && nonNullish(satVersion) && nonNullish(satRelease);

	let ctrlReady = false;
	$: ctrlReady = nonNullish($versionStore) && nonNullish(ctrlVersion) && nonNullish(ctrlRelease);
</script>

{#if ctrlReady && ctrlVersion !== ctrlRelease}
	<p>
		<IconNewReleases /> A new version of your mission control is available! Upgrade it with the Cli.
	</p>
{/if}

{#if satReady && satVersion !== satRelease}
	<p><IconNewReleases /> A new version of your satellite is available! Upgrade it with the Cli.</p>
{/if}

<style lang="scss">
	@use '../../styles/mixins/info';

	p {
		@include info.warning;
	}
</style>
