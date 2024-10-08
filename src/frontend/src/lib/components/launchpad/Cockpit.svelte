<script lang="ts">
	import { i18n } from '$lib/stores/i18n.store';
	import IconMissionControl from '$lib/components/icons/IconMissionControl.svelte';
	import LaunchpadLink from '$lib/components/launchpad/LaunchpadLink.svelte';
	import { missionControlStore } from '$lib/stores/mission-control.store';
	import { loadOrbiters } from '$lib/services/orbiters.services';
	import { nonNullish } from '@dfinity/utils';
	import { orbiterStore } from '$lib/stores/orbiter.store';
	import { fade } from 'svelte/transition';
	import IconAnalytics from '$lib/components/icons/IconAnalytics.svelte';
	import Canister from '$lib/components/canister/Canister.svelte';
	import type { CanisterData } from '$lib/types/canister';
	import CanisterIndicator from '$lib/components/canister/CanisterIndicator.svelte';

	$: $missionControlStore,
		(async () => await loadOrbiters({ missionControl: $missionControlStore }))();

	let missionControlData: CanisterData | undefined = undefined;
	let orbiterData: CanisterData | undefined = undefined;
</script>

{#if nonNullish($missionControlStore)}
	<Canister
		canisterId={$missionControlStore}
		segment="mission_control"
		display={false}
		bind:data={missionControlData}
	/>
{/if}

<div class="mission-control">
	<LaunchpadLink
		size="small"
		href="/mission-control"
		ariaLabel={`${$i18n.satellites.open}: ${$i18n.mission_control.title}`}
	>
		<p>
			<IconMissionControl />
			<span>{$i18n.mission_control.title} <CanisterIndicator data={missionControlData} /></span>
		</p>
	</LaunchpadLink>
</div>

{#if nonNullish($orbiterStore)}
	<Canister
		canisterId={$orbiterStore.orbiter_id}
		segment="orbiter"
		display={false}
		bind:data={orbiterData}
	/>

	<div in:fade class="analytics">
		<LaunchpadLink
			size="small"
			href="/analytics"
			ariaLabel={`${$i18n.satellites.open}: ${$i18n.analytics.title}`}
		>
			<p>
				<IconAnalytics size="24px" />
				<span>{$i18n.analytics.title} <CanisterIndicator data={orbiterData} /></span>
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

	span {
		display: inline-flex;
		align-items: center;
		gap: var(--padding);
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
