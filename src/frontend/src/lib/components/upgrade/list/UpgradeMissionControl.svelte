<script lang="ts">
	import { assertNonNullish, nonNullish } from '@dfinity/utils';
	import UpgradeSegment from '$lib/components/upgrade/list/UpgradeSegment.svelte';
	import { missionControlVersion } from '$lib/derived/version.derived';
	import { openUpgradeModal } from '$lib/services/upgrade/upgrade.init.services';
	import { i18n } from '$lib/stores/i18n.store';

	const startUpgrade = async () => {
		// Component is not rendered if undefined. Hence, it's rather a TS guard rather than a meaningful check.
		assertNonNullish($missionControlVersion);

		await openUpgradeModal({
			type: 'upgrade_mission_control',
			currentVersion: $missionControlVersion.current
		});
	};
</script>

{#if nonNullish($missionControlVersion) && $missionControlVersion.warning}
	<UpgradeSegment
		segmentLabel={$i18n.mission_control.title}
		source="juno"
		{startUpgrade}
		version={$missionControlVersion}
	/>
{/if}
