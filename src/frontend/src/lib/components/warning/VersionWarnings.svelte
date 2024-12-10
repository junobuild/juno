<script lang="ts">
	import { isNullish, nonNullish } from '@dfinity/utils';
	import type { BuildType } from '@junobuild/admin';
	import { compare } from 'semver';
	import { run } from 'svelte/legacy';
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import IconNewReleases from '$lib/components/icons/IconNewReleases.svelte';
	import Html from '$lib/components/ui/Html.svelte';
	import { loadVersion } from '$lib/services/console.services';
	import { newerReleases } from '$lib/services/upgrade.services';
	import { busy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { versionStore } from '$lib/stores/version.store';
	import { emit } from '$lib/utils/events.utils';
	import { missionControlStore } from '$lib/derived/mission-control.derived';

	interface Props {
		satellite?: Satellite | undefined;
	}

	let { satellite = undefined }: Props = $props();

	const load = async (skipReload: boolean) =>
		await loadVersion({
			satelliteId: satellite?.satellite_id,
			missionControlId: $missionControlStore,
			skipReload
		});

	run(() => {
		// @ts-expect-error TODO: to be migrated to Svelte v5
		$missionControlStore, satellite, (async () => await load(true))();
	});

	let satVersion: string | undefined = $derived(
		nonNullish(satellite) && nonNullish(satellite?.satellite_id)
			? $versionStore?.satellites[satellite?.satellite_id.toText()]?.current
			: undefined
	);
	let satRelease: string | undefined = $derived(
		nonNullish(satellite) && nonNullish(satellite?.satellite_id)
			? $versionStore?.satellites[satellite?.satellite_id.toText()]?.release
			: undefined
	);
	let satBuild: BuildType | undefined = $derived(
		nonNullish(satellite) && nonNullish(satellite?.satellite_id)
			? $versionStore?.satellites[satellite?.satellite_id.toText()]?.build
			: undefined
	);

	let ctrlVersion: string | undefined = $derived($versionStore?.missionControl?.current);
	let ctrlRelease: string | undefined = $derived($versionStore?.missionControl?.release);

	let orbVersion: string | undefined = $derived($versionStore?.orbiter?.current);
	let orbRelease: string | undefined = $derived($versionStore?.orbiter?.release);

	let satReady = $state(false);
	run(() => {
		satReady = nonNullish($versionStore) && nonNullish(satVersion) && nonNullish(satRelease);
	});

	let ctrlReady = $state(false);
	run(() => {
		ctrlReady = nonNullish($versionStore) && nonNullish(ctrlVersion) && nonNullish(ctrlRelease);
	});

	let orbReady = $state(false);
	run(() => {
		orbReady = nonNullish($versionStore) && nonNullish(orbVersion) && nonNullish(orbRelease);
	});

	let satWarning = $state(false);
	run(() => {
		satWarning =
			nonNullish(satVersion) && nonNullish(satRelease) && compare(satVersion, satRelease) < 0;
	});

	let ctrlWarning = $state(false);
	run(() => {
		ctrlWarning =
			nonNullish(ctrlVersion) && nonNullish(ctrlRelease) && compare(ctrlVersion, ctrlRelease) < 0;
	});

	let orbWarning = $state(false);
	run(() => {
		orbWarning =
			nonNullish(orbVersion) && nonNullish(orbRelease) && compare(orbVersion, orbRelease) < 0;
	});

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

<svelte:window onjunoReloadVersions={async () => await load(false)} />

{#if ctrlReady && ctrlWarning}
	<div>
		<p>
			<IconNewReleases />
			<Html text={$i18n.admin.mission_control_new_version} />
		</p>

		<button class="primary" onclick={upgradeMissionControl}>{$i18n.canisters.upgrade}</button>
	</div>
{/if}

{#if orbReady && orbWarning}
	<div>
		<p>
			<IconNewReleases />
			<Html text={$i18n.admin.orbiter_new_version} />
		</p>

		<button class="primary" onclick={upgradeOrbiter}>{$i18n.canisters.upgrade}</button>
	</div>
{/if}

{#if satReady && satWarning}
	<div>
		<p>
			<IconNewReleases />
			<Html text={$i18n.admin.satellite_new_version} />
		</p>
		<button class="primary" onclick={upgradeSatellite}>{$i18n.canisters.upgrade}</button>
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
