<script lang="ts">
	import { versionStore } from '$lib/stores/version.store';
	import { nonNullish } from '$lib/utils/utils';
	import IconNewReleases from '$lib/components/icons/IconNewReleases.svelte';
	import { loadVersion } from '$lib/services/console.services';
	import { missionControlStore } from '$lib/stores/mission-control.store';
	import { satelliteStore } from '$lib/stores/satellite.store';
	import { i18n } from '$lib/stores/i18n.store';
	import ExternalLink from '$lib/components/ui/ExternalLink.svelte';
	import {compare} from "semver";

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

	let satWarning = false;
	$: satWarning = nonNullish(satVersion) && nonNullish(satRelease) && compare(satVersion, ctrlRelease) < 0;

	let ctrlWarning = false;
	$: ctrlWarning = nonNullish(ctrlVersion) && nonNullish(ctrlRelease) && compare(ctrlVersion, ctrlRelease) < 0;

	const helpLink = 'https://juno.build/docs/miscellaneous/cli#upgrade';
</script>

{#if ctrlReady && ctrlWarning}
	<p>
		<IconNewReleases />
		{$i18n.admin.mission_control_new_version}
		<span class="help"><ExternalLink href={helpLink}>[Help]</ExternalLink></span>
	</p>
{/if}

{#if satReady && satWarning}
	<p>
		<IconNewReleases />
		{$i18n.admin.satellite_new_version}
		<span class="help"><ExternalLink href={helpLink}>[Help]</ExternalLink></span>
	</p>
{/if}

<style lang="scss">
	@use '../../styles/mixins/info';
	@use '../../styles/mixins/fonts';

	p {
		@include info.warning;
	}

	.help {
		@include fonts.small;
	}
</style>
