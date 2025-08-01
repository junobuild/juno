<script lang="ts">
	import { fromNullable, fromNullishNullable } from '@dfinity/utils';
	import { fade } from 'svelte/transition';
	import IconAnalytics from '$lib/components/icons/IconAnalytics.svelte';
	import IconMissionControl from '$lib/components/icons/IconMissionControl.svelte';
	import IconSatellite from '$lib/components/icons/IconSatellite.svelte';
	import MonitoringArticle from '$lib/components/monitoring/MonitoringArticle.svelte';
	import NoMonitoring from '$lib/components/monitoring/NoMonitoring.svelte';
	import SpinnerParagraph from '$lib/components/ui/SpinnerParagraph.svelte';
	import {
		hasMissionControlSettings,
		missionControlMonitoring,
		missionControlSettingsNotLoaded
	} from '$lib/derived/mission-control-settings.derived';
	import { orbitersStore } from '$lib/derived/orbiter.derived';
	import { sortedSatellites } from '$lib/derived/satellites.derived';
	import { i18n } from '$lib/stores/i18n.store';
	import type { MissionControlId } from '$lib/types/mission-control';
	import { satelliteName } from '$lib/utils/satellite.utils';

	interface Props {
		missionControlId: MissionControlId;
	}

	let { missionControlId }: Props = $props();
</script>

{#if $missionControlSettingsNotLoaded}
	<SpinnerParagraph>{$i18n.monitoring.loading}</SpinnerParagraph>
{:else if !$hasMissionControlSettings}
	<div in:fade>
		<NoMonitoring {missionControlId} />
	</div>
{:else}
	<section in:fade>
		<MonitoringArticle
			canisterId={missionControlId}
			monitoring={$missionControlMonitoring}
			segment="mission_control"
			segmentLabel={$i18n.mission_control.title}
		>
			<IconMissionControl />
			<span>{$i18n.mission_control.title}</span>
		</MonitoringArticle>

		{#each $sortedSatellites ?? [] as satellite (satellite.satellite_id.toText())}
			<MonitoringArticle
				canisterId={satellite.satellite_id}
				monitoring={fromNullishNullable(fromNullable(satellite.settings)?.monitoring)}
				segment="satellite"
				segmentLabel={$i18n.satellites.satellite}
			>
				<IconSatellite size="24px" />
				<span>{satelliteName(satellite)}</span>
			</MonitoringArticle>
		{/each}

		{#each $orbitersStore ?? [] as orbiter (orbiter.orbiter_id.toText())}
			<MonitoringArticle
				canisterId={orbiter.orbiter_id}
				monitoring={fromNullishNullable(fromNullable(orbiter.settings)?.monitoring)}
				segment="orbiter"
				segmentLabel={$i18n.analytics.orbiter}
			>
				<IconAnalytics size="24px" />
				<span>{$i18n.analytics.title}</span>
			</MonitoringArticle>
		{/each}
	</section>
{/if}

<style lang="scss">
	@use '../../../lib/styles/mixins/grid';

	section {
		@include grid.twelve-columns;

		row-gap: var(--padding-2x);

		&:first-of-type {
			margin-top: var(--padding-3x);
		}
	}

	button {
		grid-column: 1 / 13;

		padding: var(--padding) var(--padding-4x) var(--padding);
	}
</style>
