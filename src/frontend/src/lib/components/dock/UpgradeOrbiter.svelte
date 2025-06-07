<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { compare } from 'semver';
	import UpgradeSegment from '$lib/components/dock/UpgradeSegment.svelte';
	import { orbiterLoaded } from '$lib/derived/orbiter.derived';
	import { missionControlVersion } from '$lib/derived/version.derived';
	import { i18n } from '$lib/stores/i18n.store';
	import { versionStore } from '$lib/stores/version.store';
	import type { MissionControlId } from '$lib/types/mission-control';

	let orbVersion = $derived($versionStore?.orbiter?.current);
	let orbRelease = $derived($versionStore?.orbiter?.release);

	let orbWarning = $derived(
		nonNullish(orbVersion) && nonNullish(orbRelease) && compare(orbVersion, orbRelease) < 0
	);
</script>

{#if !orbWarning && nonNullish($versionStore?.orbiter) && $orbiterLoaded}
	<UpgradeSegment
		segmentLabel={$i18n.analytics.orbiter}
		version={$versionStore.orbiter}
		source="juno"
	/>
{/if}
