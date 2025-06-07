<script lang="ts">
	import { assertNonNullish, nonNullish } from '@dfinity/utils';
	import { compare } from 'semver';
	import UpgradeSegment from '$lib/components/dock/UpgradeSegment.svelte';
	import { missionControlVersion } from '$lib/derived/version.derived';
	import { openUpgradeModal } from '$lib/services/upgrade/upgrade.init.services';
	import { i18n } from '$lib/stores/i18n.store';
	import type { MissionControlId } from '$lib/types/mission-control';

	interface Props {
		missionControlId: MissionControlId;
	}

	let { missionControlId }: Props = $props();

	let ctrlVersion = $derived($missionControlVersion?.current);
	let ctrlRelease = $derived($missionControlVersion?.release);

	let ctrlWarning = $derived(
		nonNullish(ctrlVersion) && nonNullish(ctrlRelease) && compare(ctrlVersion, ctrlRelease) < 0
	);

	const startUpgrade = async () => {
		// Component is not rendered if undefined. Hence, it's rather a TS guard rather than a meaningful check.
		assertNonNullish(ctrlVersion);

		await openUpgradeModal({
			type: 'upgrade_mission_control',
			currentVersion: ctrlVersion
		});
	};
</script>

{#if !ctrlWarning && nonNullish($missionControlVersion)}
	<UpgradeSegment
		segmentLabel={$i18n.mission_control.title}
		version={$missionControlVersion}
		source="juno"
		{startUpgrade}
	/>
{/if}
