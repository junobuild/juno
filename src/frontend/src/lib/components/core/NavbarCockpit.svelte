<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { slide } from 'svelte/transition';
	import NavbarCopy from '$lib/components/core/NavbarCopy.svelte';
	import NavbarLink from '$lib/components/core/NavbarLink.svelte';
	import IconWallet from '$lib/components/icons/IconWallet.svelte';
	import WalletInlineBalance from '$lib/components/wallet/WalletInlineBalance.svelte';
	import { balance, balanceLoaded } from '$lib/derived/balance.derived';
	import { missionControlIdDerived } from '$lib/derived/mission-control.derived';
	import { i18n } from '$lib/stores/i18n.store';
</script>

{#if nonNullish($missionControlIdDerived)}
	{#if $balanceLoaded}
		<div in:slide={{ axis: 'x' }} class="container wallet">
			<NavbarLink href="/wallet" ariaLabel={`${$i18n.core.open}: ${$i18n.wallet.title}`}>
				<IconWallet />
				<WalletInlineBalance balance={$balance} />
			</NavbarLink>
		</div>
	{/if}

	<div in:slide={{ axis: 'x' }} class="container wallet">
		<NavbarCopy missionControlId={$missionControlIdDerived} />
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
