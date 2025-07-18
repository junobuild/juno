<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { slide } from 'svelte/transition';
	import NavbarCopy from '$lib/components/core/NavbarCopy.svelte';
	import NavbarLink from '$lib/components/core/NavbarLink.svelte';
	import IconNotifications from '$lib/components/icons/IconNotifications.svelte';
	import IconWallet from '$lib/components/icons/IconWallet.svelte';
	import ButtonIcon from '$lib/components/ui/ButtonIcon.svelte';
	import Identifier from '$lib/components/ui/Identifier.svelte';
	import Popover from '$lib/components/ui/Popover.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import WalletIds from '$lib/components/wallet/WalletIds.svelte';
	import WalletInlineBalance from '$lib/components/wallet/WalletInlineBalance.svelte';
	import { balance, balanceLoaded } from '$lib/derived/balance.derived';
	import { missionControlIdDerived } from '$lib/derived/mission-control.derived';
	import { i18n } from '$lib/stores/i18n.store';

	let button: HTMLButtonElement | undefined = $state();
	let visible: boolean = $state(false);

	const close = () => (visible = false);

	const onclick = () => (visible = true);
</script>

<ButtonIcon {onclick} bind:button>
	{#snippet icon()}
		<IconWallet size="16px" />
	{/snippet}

	{$i18n.wallet.title}
</ButtonIcon>

<Popover bind:visible anchor={button} direction="rtl">
	<div class="container">
		<div>
			<Value>
				{#snippet label()}
					{$i18n.wallet.balance}
				{/snippet}

				<WalletInlineBalance balance={$balance} />
			</Value>
		</div>

		{#if nonNullish($missionControlIdDerived)}
			<WalletIds missionControlId={$missionControlIdDerived} />
		{/if}
	</div>
</Popover>

<style lang="scss">
	@use '../../styles/mixins/overlay';

	@include overlay.popover-container;

	.container {
		font-size: var(--font-size-small);
		row-gap: var(--padding);
	}

	div {
		:global(p) {
			margin: 0;
		}
	}
</style>
