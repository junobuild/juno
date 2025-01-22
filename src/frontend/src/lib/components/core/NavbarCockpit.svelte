<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { run } from 'svelte/legacy';
	import { slide } from 'svelte/transition';
	import Canister from '$lib/components/canister/Canister.svelte';
	import CanisterIndicator from '$lib/components/canister/CanisterIndicator.svelte';
	import CanisterTCycles from '$lib/components/canister/CanisterTCycles.svelte';
	import NavbarLink from '$lib/components/core/NavbarLink.svelte';
	import IconAnalytics from '$lib/components/icons/IconAnalytics.svelte';
	import IconMissionControl from '$lib/components/icons/IconMissionControl.svelte';
	import IconWallet from '$lib/components/icons/IconWallet.svelte';
	import WalletInlineBalance from '$lib/components/wallet/WalletInlineBalance.svelte';
	import { balance, balanceLoaded } from '$lib/derived/balance.derived';
	import { missionControlIdDerived } from '$lib/derived/mission-control.derived';
	import { orbiterStore } from '$lib/derived/orbiter.derived';
	import { loadOrbiters } from '$lib/services/orbiters.services';
	import { i18n } from '$lib/stores/i18n.store';
	import type { CanisterData } from '$lib/types/canister';

	let missionControlData: CanisterData | undefined = $state(undefined);
	let orbiterData: CanisterData | undefined = $state(undefined);

	run(() => {
		// @ts-expect-error TODO: to be migrated to Svelte v5
		$missionControlIdDerived,
			(async () => await loadOrbiters({ missionControlId: $missionControlIdDerived }))();
	});
</script>

{#if nonNullish($missionControlIdDerived)}
	<Canister canisterId={$missionControlIdDerived} display={false} bind:data={missionControlData} />
{/if}

{#if nonNullish($missionControlIdDerived) && nonNullish(missionControlData)}
	<div in:slide={{ axis: 'x' }} class="container">
		<NavbarLink
			href="/mission-control"
			ariaLabel={`${$i18n.core.open}: ${$i18n.mission_control.title}`}
		>
			<IconMissionControl />
			<CanisterIndicator data={missionControlData} />
			<div class="cycles"><CanisterTCycles data={missionControlData} /></div>
		</NavbarLink>
	</div>
{/if}

{#if nonNullish($orbiterStore)}
	<Canister canisterId={$orbiterStore.orbiter_id} display={false} bind:data={orbiterData} />
{/if}

{#if nonNullish($orbiterStore) && nonNullish(orbiterData)}
	<div in:slide={{ axis: 'x' }} class="container">
		<NavbarLink href="/analytics" ariaLabel={`${$i18n.core.open}: ${$i18n.analytics.title}`}>
			<IconAnalytics />
			<CanisterIndicator data={orbiterData} />
			<div class="cycles"><CanisterTCycles data={orbiterData} /></div>
		</NavbarLink>
	</div>
{/if}

{#if nonNullish($missionControlIdDerived)}
	{#if $balanceLoaded}
		<div in:slide={{ axis: 'x' }} class="container wallet">
			<NavbarLink href="/wallet" ariaLabel={`${$i18n.core.open}: ${$i18n.wallet.title}`}>
				<IconWallet />
				<WalletInlineBalance balance={$balance} />
			</NavbarLink>
		</div>
	{/if}
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
