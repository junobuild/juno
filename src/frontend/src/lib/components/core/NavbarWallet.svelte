<script lang="ts">
	import IconWallet from '$lib/components/icons/IconWallet.svelte';
	import ReceiveTokens from '$lib/components/tokens/ReceiveTokens.svelte';
	import ButtonIcon from '$lib/components/ui/ButtonIcon.svelte';
	import Popover from '$lib/components/ui/Popover.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import WalletActions from '$lib/components/wallet/WalletActions.svelte';
	import WalletIds from '$lib/components/wallet/WalletIds.svelte';
	import WalletBalanceById from '$lib/components/wallet/WalletBalanceById.svelte';
	import { testIds } from '$lib/constants/test-ids.constants';
	import type { WalletId } from '$lib/schemas/wallet.schema';
	import { i18n } from '$lib/stores/app/i18n.store';
	import WalletPicker from '$lib/components/wallet/WalletPicker.svelte';
	import { nonNullish } from '@dfinity/utils';

	let button: HTMLButtonElement | undefined = $state();
	let visible: boolean = $state(false);

	const onclick = () => (visible = true);

	let receiveVisible = $state(false);

	const openReceive = () => {
		visible = false;
		receiveVisible = true;
	};

	let walletId = $state<WalletId | undefined>(undefined);
</script>

<ButtonIcon {onclick} testId={testIds.navbar.openWallet} bind:button>
	{#snippet icon()}
		<IconWallet size="16px" />
	{/snippet}

	{$i18n.wallet.title}
</ButtonIcon>

<Popover anchor={button} direction="rtl" bind:visible>
	<div class="container">
		<WalletPicker bind:walletId />

		<div>
			<Value>
				{#snippet label()}
					{$i18n.wallet.balance}
				{/snippet}

				<WalletBalanceById {walletId} display="inline" />
			</Value>
		</div>

		{#if nonNullish(walletId)}
			<WalletIds {walletId} />

			<div class="actions">
				<WalletActions onreceive={openReceive} onsend={() => (visible = false)} {walletId} />
			</div>
		{/if}
	</div>
</Popover>

{#if nonNullish(walletId)}
	<ReceiveTokens {walletId} bind:visible={receiveVisible} />
{/if}

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

	.actions {
		margin: var(--padding) 0 0;
	}
</style>
