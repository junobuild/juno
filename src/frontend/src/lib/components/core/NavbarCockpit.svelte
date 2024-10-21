<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { slide, fade } from 'svelte/transition';
	import Canister from '$lib/components/canister/Canister.svelte';
	import CanisterIndicator from '$lib/components/canister/CanisterIndicator.svelte';
	import CanisterTCycles from '$lib/components/canister/CanisterTCycles.svelte';
	import NavbarLink from '$lib/components/core/NavbarLink.svelte';
	import Wallet from '$lib/components/core/Wallet.svelte';
	import IconAnalytics from '$lib/components/icons/IconAnalytics.svelte';
	import IconMissionControl from '$lib/components/icons/IconMissionControl.svelte';
	import IconWallet from '$lib/components/icons/IconWallet.svelte';
	import { loadOrbiters } from '$lib/services/orbiters.services';
	import { i18n } from '$lib/stores/i18n.store';
	import { missionControlStore } from '$lib/stores/mission-control.store';
	import { orbiterStore } from '$lib/stores/orbiter.store';
	import type { CanisterData } from '$lib/types/canister';
	import { formatE8sICP } from '$lib/utils/icp.utils';

	let missionControlData: CanisterData | undefined = undefined;
	let orbiterData: CanisterData | undefined = undefined;
	let balance: bigint | undefined = undefined;

	$: $missionControlStore,
		(async () => await loadOrbiters({ missionControl: $missionControlStore }))();
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

{#if nonNullish($missionControlStore)}
	<Wallet missionControlId={$missionControlStore} bind:balance>
		{#if nonNullish(balance)}
			<div in:slide={{ axis: 'x' }} class="container wallet">
				<NavbarLink
					href="/mission-control?tab=wallet"
					ariaLabel={`${$i18n.satellites.open}: ${$i18n.wallet.title}`}
				>
					<IconWallet />
					<span in:fade>{formatE8sICP(balance)} <small>ICP</small></span>
				</NavbarLink>
			</div>
		{/if}
	</Wallet>
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

		margin: 0 0 0 var(--padding-0_5x);

		@include media.min-width(medium) {
			display: block;
		}
	}

	.wallet {
		display: none;

		@include media.min-width(large) {
			display: block;
		}
	}
</style>
