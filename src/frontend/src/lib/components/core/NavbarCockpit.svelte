<script lang="ts">
	import NavbarLink from '$lib/components/core/NavbarLink.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import IconMissionControl from '$lib/components/icons/IconMissionControl.svelte';
	import Canister from '$lib/components/canister/Canister.svelte';
	import { nonNullish } from '@dfinity/utils';
	import { missionControlStore } from '$lib/stores/mission-control.store';
	import { orbiterStore } from '$lib/stores/orbiter.store';
	import IconAnalytics from '$lib/components/icons/IconAnalytics.svelte';
	import type { CanisterData } from '$lib/types/canister';
	import { slide } from 'svelte/transition';
	import CanisterIndicator from '$lib/components/canister/CanisterIndicator.svelte';
	import CanisterTCycles from '$lib/components/canister/CanisterTCycles.svelte';

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

{#if nonNullish($missionControlStore) && nonNullish(missionControlData)}
	<div in:slide={{ axis: 'x' }} class="container">
		<NavbarLink
			href="/mission-control"
			ariaLabel={`${$i18n.satellites.open}: ${$i18n.mission_control.title}`}
		>
			<IconMissionControl />
			<CanisterIndicator data={missionControlData} />
			<div class="cycles"><CanisterTCycles data={missionControlData} /></div>
		</NavbarLink>
	</div>
{/if}

{#if nonNullish($orbiterStore)}
	<Canister
		canisterId={$orbiterStore.orbiter_id}
		segment="orbiter"
		display={false}
		bind:data={orbiterData}
	/>
{/if}

{#if nonNullish($orbiterStore) && nonNullish(orbiterData)}
	<div in:slide={{ axis: 'x' }} class="container">
		<NavbarLink href="/analytics" ariaLabel={`${$i18n.satellites.open}: ${$i18n.analytics.title}`}>
			<IconAnalytics />
			<CanisterIndicator data={orbiterData} />
			<div class="cycles"><CanisterTCycles data={orbiterData} /></div>
		</NavbarLink>
	</div>
{/if}

<style lang="scss">
	@use '../../styles/mixins/media';

	.container {
		display: none;

		@include media.min-width(small) {
			display: flex;
		}
	}

	.cycles {
		display: none;

		@include media.min-width(medium) {
			display: block;
		}
	}
</style>
