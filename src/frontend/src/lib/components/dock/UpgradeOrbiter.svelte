<script lang="ts">
	import { assertNonNullish, nonNullish } from '@dfinity/utils';
	import { compare } from 'semver';
	import UpgradeSegment from '$lib/components/dock/UpgradeSegment.svelte';
	import { orbiterLoaded } from '$lib/derived/orbiter.derived';
	import { missionControlVersion } from '$lib/derived/version.derived';
	import { i18n } from '$lib/stores/i18n.store';
	import { versionStore } from '$lib/stores/version.store';
	import type { MissionControlId } from '$lib/types/mission-control';
	import { openUpgradeModal } from '$lib/services/upgrade/upgrade.init.services';

	let orbVersion = $derived($versionStore?.orbiter?.current);
	let orbRelease = $derived($versionStore?.orbiter?.release);

	let orbWarning = $derived(
		nonNullish(orbVersion) && nonNullish(orbRelease) && compare(orbVersion, orbRelease) < 0
	);

	const startUpgrade = async () => {
		// Component is not rendered if undefined. Hence, it's rather a TS guard rather than a meaningful check.
		assertNonNullish(orbVersion);

		await openUpgradeModal({
			type: 'upgrade_mission_control',
			currentVersion: orbVersion
		});
	};
</script>

{#if !orbWarning && nonNullish($versionStore?.orbiter) && $orbiterLoaded}
	<UpgradeSegment
		segmentLabel={$i18n.analytics.orbiter}
		version={$versionStore.orbiter}
		source="juno"
		{startUpgrade}
	/>
{/if}
