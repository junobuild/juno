<script lang="ts">
	import { assertNonNullish, nonNullish } from '@dfinity/utils';
	import { compare } from 'semver';
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import UpgradeSegment from '$lib/components/dock/UpgradeSegment.svelte';
	import { versionStore } from '$lib/stores/version.store';
	import { satelliteName } from '$lib/utils/satellite.utils';
	import { openUpgradeModal } from '$lib/services/upgrade/upgrade.init.services';
	import type { BuildType } from '@junobuild/admin';

	interface Props {
		satellite: Satellite;
	}

	let { satellite }: Props = $props();

	let version = $derived($versionStore?.satellites[satellite.satellite_id.toText()]);

	let satVersion = $derived(version?.current);
	let satRelease = $derived(version?.release);

	let satBuild = $derived(version?.build);

	let satWarning = $derived(
		nonNullish(satVersion) && nonNullish(satRelease) && compare(satVersion, satRelease) < 0
	);

	const startUpgrade = async () => {
		// Component is not rendered if undefined. Hence, it's rather a TS guard rather than a meaningful check.
		assertNonNullish(satVersion);

		await openUpgradeModal({
			type: 'upgrade_satellite',
			satellite,
			currentVersion: satVersion,
			build: satBuild
		});
	};
</script>

{#if !satWarning && nonNullish(version)}
	<UpgradeSegment segmentLabel={satelliteName(satellite)} {version} source="juno" {startUpgrade} />
{/if}
