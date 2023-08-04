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
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import { newerReleases } from '$lib/services/upgrade.services';

	const load = async (skipReload: boolean) =>
		await loadVersion({
			satelliteId: $satelliteStore?.satellite_id,
			missionControlId: $missionControlStore,
			skipReload
		});

	$: $missionControlStore, $satelliteStore, (async () => await load(true))();

	let satVersion: string | undefined;
	let satRelease: string | undefined;

	let ctrlVersion: string | undefined;
	let ctrlRelease: string | undefined;

	$: satVersion =
		nonNullish($satelliteStore) && nonNullish($satelliteStore?.satellite_id)
			? $versionStore?.satellites[$satelliteStore?.satellite_id.toText()]?.current
			: undefined;
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

	let satWarning = false;
	$: satWarning =
		nonNullish(satVersion) && nonNullish(satRelease) && compare(satVersion, satRelease) < 0;

	let ctrlWarning = false;
	$: ctrlWarning =
		nonNullish(ctrlVersion) && nonNullish(ctrlRelease) && compare(ctrlVersion, ctrlRelease) < 0;

	const helpLink = 'https://juno.build/docs/miscellaneous/cli#upgrade';

	const openModal = async ({
		currentVersion,
		type,
		satellite
	}: {
		currentVersion: string;
		type: 'upgrade_satellite' | 'upgrade_mission_control';
		satellite?: Satellite;
	}) => {
		busy.start();

		const { result, error } = await newerReleases({
			currentVersion,
			segments: type === 'upgrade_mission_control' ? 'mission_controls' : 'satellites'
		});

		busy.stop();

		if (nonNullish(error) || isNullish(result)) {
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

<svelte:window on:junoReloadVersions={async () => await load(false)} />

{#if ctrlReady && ctrlWarning}
	<div>
		<p>
			<IconNewReleases />
			{@html $i18n.admin.mission_control_new_version}
		</p>

		<button class="primary" on:click={upgradeMissionControl}>{$i18n.canisters.upgrade}</button>
	</div>
{/if}

{#if satReady && satWarning}
	<div>
		<p>
			<IconNewReleases />
			{@html $i18n.admin.satellite_new_version}
		</p>
		<button class="primary" on:click={upgradeSatellite}>{$i18n.canisters.upgrade}</button>
	</div>
{/if}

<style lang="scss">
	@use '../../styles/mixins/info';

	div {
		@include info.warning;

		button {
			@include info.warning-button;
		}
	}

	p {
		margin: 0 0 var(--padding);
	}

	button {
		margin: var(--padding-1_5x) 0 var(--padding-0_5x);
	}
</style>
