<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { compare } from 'semver';
	import UpgradeSegment from '$lib/components/dock/UpgradeSegment.svelte';
	import { missionControlVersion } from '$lib/derived/version.derived';
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
</script>

{#if !ctrlWarning && nonNullish($missionControlVersion)}
	<UpgradeSegment
		segmentLabel={$i18n.mission_control.title}
		version={$missionControlVersion}
		source="juno"
	/>
{/if}
