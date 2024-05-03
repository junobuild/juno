<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store.js';
	import IconMissionControl from '$lib/components/icons/IconMissionControl.svelte';
	import LaunchpadLink from '$lib/components/launchpad/LaunchpadLink.svelte';
	import { missionControlStore } from '$lib/stores/mission-control.store';
	import { loadOrbiters } from '$lib/services/orbiters.services';
	import { nonNullish } from '@dfinity/utils';
	import { orbiterStore } from '$lib/stores/orbiter.store';
	import { fade } from 'svelte/transition';
	import IconAnalytics from '$lib/components/icons/IconAnalytics.svelte';

	$: $missionControlStore,
		(async () => await loadOrbiters({ missionControl: $missionControlStore }))();
</script>

<div class="mission-control">
	<LaunchpadLink
		size="small"
		href="/mission-control"
		ariaLabel={`${$i18n.satellites.open}: ${$i18n.mission_control.title}`}
	>
		<p>
			<IconMissionControl />
			<span>{$i18n.mission_control.title}</span>
		</p>
	</LaunchpadLink>
</div>

{#if nonNullish($orbiterStore)}
	<div in:fade class="analytics">
		<LaunchpadLink
			size="small"
			href="/analytics"
			ariaLabel={`${$i18n.satellites.open}: ${$i18n.analytics.title}`}
		>
			<p>
				<IconAnalytics size="24px" />
				<span>{$i18n.analytics.title}</span>
			</p>
		</LaunchpadLink>
	</div>
{/if}

<style lang="scss">
	@use '../../../lib/styles/mixins/grid';
	@use '../../../lib/styles/mixins/media';
	@use '../../../lib/styles/mixins/fonts';

	p {
		@include fonts.bold(true);

		display: flex;
		align-items: center;
		gap: var(--padding-3x);

		margin: 0 0 var(--padding);
	}

	.mission-control {
		grid-column: 1 / 13;

		@include media.min-width(medium) {
			grid-column: 1 / 7;
		}
	}

	.analytics {
		grid-column: 1 / 13;

		@include media.min-width(medium) {
			grid-column: 7 / 13;
		}
	}
</style>
