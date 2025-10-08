<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import type { BuildType } from '@junobuild/admin';
	import { compare } from 'semver';
	import type { MissionControlDid } from '$declarations';
	import VersionWarning from '$lib/components/warning/VersionWarning.svelte';
	import { missionControlVersion } from '$lib/derived/version.derived';
	import { openUpgradeModal } from '$lib/services/upgrade/upgrade.init.services';
	import { i18n } from '$lib/stores/i18n.store';
	import { versionStore } from '$lib/stores/version.store';

	interface Props {
		satellite?: MissionControlDid.Satellite | undefined;
	}

	let { satellite = undefined }: Props = $props();

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

	let ctrlVersion: string | undefined = $derived($missionControlVersion?.current);
	let ctrlRelease: string | undefined = $derived($missionControlVersion?.release);

	let orbVersion: string | undefined = $derived($versionStore?.orbiter?.current);
	let orbRelease: string | undefined = $derived($versionStore?.orbiter?.release);

	let satReady = $derived(
		nonNullish($versionStore) && nonNullish(satVersion) && nonNullish(satRelease)
	);

	let ctrlReady = $derived(
		nonNullish($versionStore) && nonNullish(ctrlVersion) && nonNullish(ctrlRelease)
	);

	let orbReady = $derived(
		nonNullish($versionStore) && nonNullish(orbVersion) && nonNullish(orbRelease)
	);

	let satWarning = $derived(
		nonNullish(satVersion) && nonNullish(satRelease) && compare(satVersion, satRelease) < 0
	);

	let ctrlWarning = $derived(
		nonNullish(ctrlVersion) && nonNullish(ctrlRelease) && compare(ctrlVersion, ctrlRelease) < 0
	);

	let orbWarning = $derived(
		nonNullish(orbVersion) && nonNullish(orbRelease) && compare(orbVersion, orbRelease) < 0
	);

	const upgradeSatellite = async () =>
		await openUpgradeModal({
			type: 'upgrade_satellite',
			// TODO: resolve no-non-null-assertion.
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			satellite: satellite!,
			// TODO: resolve no-non-null-assertion.
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			currentVersion: satVersion!,
			build: satBuild
		});

	const upgradeMissionControl = async () =>
		await openUpgradeModal({
			type: 'upgrade_mission_control',
			// TODO: resolve no-non-null-assertion.
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			currentVersion: ctrlVersion!
		});

	const upgradeOrbiter = async () =>
		await openUpgradeModal({
			type: 'upgrade_orbiter',
			// TODO: resolve no-non-null-assertion.
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			currentVersion: orbVersion!
		});
</script>

{#if ctrlReady && ctrlWarning}
	<VersionWarning onclick={upgradeMissionControl} text={$i18n.admin.mission_control_new_version} />
{/if}

{#if orbReady && orbWarning}
	<VersionWarning onclick={upgradeOrbiter} text={$i18n.admin.orbiter_new_version} />
{/if}

{#if satReady && satWarning}
	<VersionWarning onclick={upgradeSatellite} text={$i18n.admin.satellite_new_version} />
{/if}
