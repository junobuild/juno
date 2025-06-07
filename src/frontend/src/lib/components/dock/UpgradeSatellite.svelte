<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { compare } from 'semver';
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import UpgradeSegment from '$lib/components/dock/UpgradeSegment.svelte';
	import { versionStore } from '$lib/stores/version.store';
	import { satelliteName } from '$lib/utils/satellite.utils';

	interface Props {
		satellite: Satellite;
	}

	let { satellite }: Props = $props();

	let version = $derived($versionStore?.satellites[satellite.satellite_id.toText()]);

	let satVersion = $derived(version?.current);
	let satRelease = $derived(version?.release);

	let satWarning = $derived(
		nonNullish(satVersion) && nonNullish(satRelease) && compare(satVersion, satRelease) < 0
	);
</script>

{#if !satWarning && nonNullish(version)}
	<UpgradeSegment segmentLabel={satelliteName(satellite)} {version} source="juno" />
{/if}
