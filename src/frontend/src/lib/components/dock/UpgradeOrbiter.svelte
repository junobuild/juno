<script lang="ts">
	import { assertNonNullish, nonNullish } from '@dfinity/utils';
	import { compare } from 'semver';
	import UpgradeSegment from '$lib/components/dock/UpgradeSegment.svelte';
	import { orbiterLoaded } from '$lib/derived/orbiter.derived';
	import {missionControlVersion, orbiterVersion} from '$lib/derived/version.derived';
	import { openUpgradeModal } from '$lib/services/upgrade/upgrade.init.services';
	import { i18n } from '$lib/stores/i18n.store';
	import { versionStore } from '$lib/stores/version.store';
	import type { MissionControlId } from '$lib/types/mission-control';

	const startUpgrade = async () => {
		// Component is not rendered if undefined. Hence, it's rather a TS guard rather than a meaningful check.
		assertNonNullish($orbiterVersion);

		await openUpgradeModal({
			type: 'upgrade_orbiter',
			currentVersion: $orbiterVersion.current
		});
	};
</script>

{#if nonNullish($orbiterVersion) && $orbiterVersion.warning && nonNullish($versionStore.orbiter)}
	<UpgradeSegment
		segmentLabel={$i18n.analytics.orbiter}
		version={$versionStore.orbiter}
		source="juno"
		{startUpgrade}
	/>
{/if}
