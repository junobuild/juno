<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import { isNullish } from '@dfinity/utils';
	import { fade } from 'svelte/transition';
	import NoMonitoring from '$lib/components/monitoring/NoMonitoring.svelte';
	import SpinnerParagraph from '$lib/components/ui/SpinnerParagraph.svelte';
	import {
		missionControlMonitoring,
		missionControlSettings,
		missionControlSettingsNotLoaded
	} from '$lib/derived/mission-control.derived';
	import { i18n } from '$lib/stores/i18n.store';
	import MonitoringArticle from '$lib/components/monitoring/MonitoringArticle.svelte';
	import CanisterIndicator from '$lib/components/canister/CanisterIndicator.svelte';
	import IconMissionControl from '$lib/components/icons/IconMissionControl.svelte';
	import CanisterMonitoringLoader from '$lib/components/loaders/CanisterMonitoringLoader.svelte';

	interface Props {
		missionControlId: Principal;
	}

	let { missionControlId }: Props = $props();
</script>

{#if $missionControlSettingsNotLoaded}
	<SpinnerParagraph>{$i18n.monitoring.loading}</SpinnerParagraph>
{:else if isNullish($missionControlSettings)}
	<div in:fade>
		<NoMonitoring {missionControlId} />
	</div>
{:else}
	<section in:fade>
		<MonitoringArticle
			monitoring={$missionControlMonitoring}
			canisterId={missionControlId}
			segment="mission_control"
		>
			<IconMissionControl />
			<span>{$i18n.mission_control.title}</span>
		</MonitoringArticle>
	</section>
{/if}

<style lang="scss">
	@use '../../../lib/styles/mixins/grid';

	section {
		@include grid.twelve-columns;

		padding: var(--padding-2x) 0;

		&:first-of-type {
			margin-top: var(--padding-4x);
		}
	}

	button {
		grid-column: 1 / 13;

		padding: var(--padding) var(--padding-4x) var(--padding);
	}
</style>
