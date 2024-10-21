<script lang="ts">
	import { isNullish, nonNullish } from '@dfinity/utils';
	import type { BuildType } from '@junobuild/admin';
	import { compare } from 'semver';
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import IconNewReleases from '$lib/components/icons/IconNewReleases.svelte';
	import { loadVersion } from '$lib/services/console.services';
	import { newerReleases } from '$lib/services/upgrade.services';
	import { busy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { missionControlStore } from '$lib/stores/mission-control.store';
	import { versionStore } from '$lib/stores/version.store';
	import { emit } from '$lib/utils/events.utils';

	export let satellite: Satellite | undefined = undefined;

	const load = async (skipReload: boolean) =>
		await loadVersion({
			satelliteId: satellite?.satellite_id,
			missionControlId: $missionControlStore,
			skipReload
		});

	$: $missionControlStore, satellite, (async () => await load(true))();

	let satVersion: string | undefined;
	let satRelease: string | undefined;
	let satBuild: BuildType | undefined;

	let ctrlVersion: string | undefined;
	let ctrlRelease: string | undefined;

	let orbVersion: string | undefined;
	let orbRelease: string | undefined;

	$: satVersion =
		nonNullish(satellite) && nonNullish(satellite?.satellite_id)
			? $versionStore?.satellites[satellite?.satellite_id.toText()]?.current
			: undefined;
	$: satRelease =
		nonNullish(satellite) && nonNullish(satellite?.satellite_id)
			? $versionStore?.satellites[satellite?.satellite_id.toText()]?.release
			: undefined;
	$: satBuild =
		nonNullish(satellite) && nonNullish(satellite?.satellite_id)
			? $versionStore?.satellites[satellite?.satellite_id.toText()]?.build
			: undefined;

	$: ctrlVersion = $versionStore?.missionControl?.current;
	$: ctrlRelease = $versionStore?.missionControl?.release;

	$: orbVersion = $versionStore?.orbiter?.current;
	$: orbRelease = $versionStore?.orbiter?.release;

	let satReady = false;
	$: satReady = nonNullish($versionStore) && nonNullish(satVersion) && nonNullish(satRelease);

	let ctrlReady = false;
	$: ctrlReady = nonNullish($versionStore) && nonNullish(ctrlVersion) && nonNullish(ctrlRelease);

	let orbReady = false;
	$: orbReady = nonNullish($versionStore) && nonNullish(orbVersion) && nonNullish(orbRelease);

	let satWarning = false;
	$: satWarning =
		nonNullish(satVersion) && nonNullish(satRelease) && compare(satVersion, satRelease) < 0;

	let ctrlWarning = false;
	$: ctrlWarning =
		nonNullish(ctrlVersion) && nonNullish(ctrlRelease) && compare(ctrlVersion, ctrlRelease) < 0;

	let orbWarning = false;
	$: orbWarning =
		nonNullish(orbVersion) && nonNullish(orbRelease) && compare(orbVersion, orbRelease) < 0;

	const openModal = async ({
		currentVersion,
		type,
		satellite,
		build
	}: {
		currentVersion: string;
		type: 'upgrade_satellite' | 'upgrade_mission_control' | 'upgrade_orbiter';
		satellite?: Satellite;
		build?: BuildType;
	}) => {
		busy.start();

		const { result, error } = await newerReleases({
			currentVersion,
			segments:
				type === 'upgrade_mission_control'
					? 'mission_controls'
					: type === 'upgrade_orbiter'
						? 'orbiters'
						: 'satellites'
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
					newerReleases: result,
					build
				}
			}
		});
	};

	const upgradeSatellite = async () =>
		await openModal({
			type: 'upgrade_satellite',
			satellite: satellite!,
			currentVersion: satVersion!,
			build: satBuild
		});

	const upgradeMissionControl = async () =>
		await openModal({
			type: 'upgrade_mission_control',
			currentVersion: ctrlVersion!
		});

	const upgradeOrbiter = async () =>
		await openModal({
			type: 'upgrade_orbiter',
			currentVersion: orbVersion!
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

{#if orbReady && orbWarning}
	<div>
		<p>
			<IconNewReleases />
			{@html $i18n.admin.orbiter_new_version}
		</p>

		<button class="primary" on:click={upgradeOrbiter}>{$i18n.canisters.upgrade}</button>
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
