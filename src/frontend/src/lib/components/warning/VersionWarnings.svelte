<script lang="ts">
	import { versionStore } from '$lib/stores/version.store';
	import { isNullish, nonNullish } from '$lib/utils/utils';
	import IconNewReleases from '$lib/components/icons/IconNewReleases.svelte';
	import { loadVersion } from '$lib/services/console.services';
	import { missionControlStore } from '$lib/stores/mission-control.store';
	import { satelliteStore } from '$lib/stores/satellite.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { compare } from 'semver';
	import { emit } from '$lib/utils/events.utils';
	import { busy } from '$lib/stores/busy.store';
	import { newerReleases } from '@junobuild/admin';
	import { toasts } from '$lib/stores/toasts.store';
	import type { NewerReleasesParams } from '@junobuild/admin';
	import type { Satellite } from '$declarations/mission_control/mission_control.did';

	const load = async () =>
		await loadVersion({
			satelliteId: $satelliteStore?.satellite_id,
			missionControlId: $missionControlStore
		});

	$: $missionControlStore, $satelliteStore, (async () => await load())();

	// TODO: undefined
	let satVersion: string | undefined = '0.0.7';
	let satRelease: string | undefined;

	let ctrlVersion: string | undefined;
	let ctrlRelease: string | undefined;

	// TODO: uncomment
	// $: satVersion =
	// 	nonNullish($satelliteStore) && nonNullish($satelliteStore?.satellite_id)
	// 		? $versionStore?.satellites[$satelliteStore?.satellite_id.toText()]?.current
	// 		: undefined;
	$: satRelease =
		nonNullish($satelliteStore) && nonNullish($satelliteStore?.satellite_id)
			? $versionStore?.satellites[$satelliteStore?.satellite_id.toText()]?.release
			: undefined;

	$: ctrlVersion = $versionStore?.missionControl?.current;
	$: ctrlRelease = $versionStore?.missionControl?.release;

	let satReady = false;
	$: satReady = nonNullish($versionStore) && nonNullish(satVersion) && nonNullish(satRelease);

	let ctrlReady = false;
	$: ctrlReady = nonNullish($versionStore) && nonNullish(ctrlVersion) && nonNullish(ctrlRelease);

	let satWarning = true;

	// TODO: uncomment
	// $: satWarning =
	// 		nonNullish(satVersion) && nonNullish(satRelease) && compare(satVersion, satRelease) < 0;

	let ctrlWarning = false;
	$: ctrlWarning =
		nonNullish(ctrlVersion) && nonNullish(ctrlRelease) && compare(ctrlVersion, ctrlRelease) < 0;

	const helpLink = 'https://juno.build/docs/miscellaneous/cli#upgrade';

	const openModal = async ({
		currentVersion,
		type,
		satellite
	}: Pick<NewerReleasesParams, 'currentVersion'> & {
		type: 'upgrade_satellite' | 'upgrade_mission_control';
		satellite?: Satellite;
	}) => {
		busy.start();

		const { result, error } = await newerReleases({
			currentVersion,
			assetKey: type === 'upgrade_mission_control' ? 'mission_control' : 'satellite'
		});

		busy.stop();

		if (nonNullish(error) || isNullish(result)) {
			toasts.error({
				text: $i18n.errors.upgrade_load_versions,
				detail: error
			});
			return;
		}

		emit({
			message: 'junoModal',
			detail: {
				type,
				detail: {
					...(nonNullish(satellite) && { satellite }),
					currentVersion,
					newerReleases: result
				}
			}
		});
	};

	const upgradeSatellite = async () =>
		await openModal({
			type: 'upgrade_satellite',
			satellite: $satelliteStore!,
			currentVersion: satVersion!
		});

	const upgradeMissionControl = async () =>
		await openModal({
			type: 'upgrade_mission_control',
			currentVersion: ctrlVersion!
		});
</script>

{#if ctrlReady && ctrlWarning}
	<p>
		<IconNewReleases />
		{@html $i18n.admin.mission_control_new_version}
	</p>
{/if}

{#if satReady && satWarning}
	<p>
		<IconNewReleases />
		{@html $i18n.admin.satellite_new_version}
		<button class="primary" on:click={upgradeSatellite}>Upgrade</button>
	</p>
{/if}

<style lang="scss">
	@use '../../styles/mixins/info';
	@use '../../styles/mixins/fonts';

	p {
		@include info.warning;
		margin: var(--padding-2x) 0 var(--padding-4x);
	}

	.help {
		@include fonts.small;
		vertical-align: text-bottom;
	}
</style>
