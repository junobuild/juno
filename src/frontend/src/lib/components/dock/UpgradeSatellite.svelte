<script lang="ts">
	import { assertNonNullish, nonNullish } from '@dfinity/utils';
	import type { BuildType } from '@junobuild/admin';
	import { compare } from 'semver';
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import UpgradeSegment from '$lib/components/dock/UpgradeSegment.svelte';
	import { openUpgradeModal } from '$lib/services/upgrade/upgrade.init.services';
	import { versionStore } from '$lib/stores/version.store';
	import { satelliteName } from '$lib/utils/satellite.utils';
	import { satellitesVersion } from '$lib/derived/version.derived';

	interface Props {
		satellite: Satellite;
	}

	let { satellite }: Props = $props();

	let version = $derived($satellitesVersion?.[satellite.satellite_id.toText()]);

	let satBuild = $derived(version?.build);

	const startUpgrade = async () => {
		// Component is not rendered if undefined. Hence, it's rather a TS guard rather than a meaningful check.
		assertNonNullish(version);

		await openUpgradeModal({
			type: 'upgrade_satellite',
			satellite,
			currentVersion: version.current,
			build: satBuild
		});
	};
</script>

{#if nonNullish(version) && version.warning}
	<UpgradeSegment segmentLabel={satelliteName(satellite)} {version} source="juno" {startUpgrade} />
{/if}
