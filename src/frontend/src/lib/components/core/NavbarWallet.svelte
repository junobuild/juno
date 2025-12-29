<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import IconWallet from '$lib/components/icons/IconWallet.svelte';
	import ButtonIcon from '$lib/components/ui/ButtonIcon.svelte';
	import Hr from '$lib/components/ui/Hr.svelte';
	import Popover from '$lib/components/ui/Popover.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import WalletActions from '$lib/components/wallet/WalletActions.svelte';
	import WalletBalanceById from '$lib/components/wallet/WalletBalanceById.svelte';
	import WalletIds from '$lib/components/wallet/WalletIds.svelte';
	import WalletPicker from '$lib/components/wallet/WalletPicker.svelte';
	import WalletTotal from '$lib/components/wallet/WalletTotal.svelte';
	import ReceiveTokens from '$lib/components/wallet/tokens/ReceiveTokens.svelte';
	import { testIds } from '$lib/constants/test-ids.constants';
	import type { SelectedWallet } from '$lib/schemas/wallet.schema';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { CYCLES_LEDGER_CANISTER_ID } from '$lib/constants/app.constants';

	let button: HTMLButtonElement | undefined = $state();
	let visible: boolean = $state(false);

	const onclick = () => (visible = true);

	let receiveVisible = $state(false);

	const openReceive = () => {
		visible = false;
		receiveVisible = true;
	};

	let selectedWallet = $state<SelectedWallet | undefined>(undefined);
</script>

<ButtonIcon {onclick} testId={testIds.navbar.openWallet} bind:button>
	{#snippet icon()}
		<IconWallet size="16px" />
	{/snippet}

	{$i18n.wallet.title}
</ButtonIcon>

<Popover anchor={button} direction="rtl" bind:visible>
	<div class="container">
		<div>
			<WalletTotal />
		</div>

		<Hr />

		<div class="picker">
			<WalletPicker bind:selectedWallet />
		</div>

		<div>
			<Value>
				{#snippet label()}
					{$i18n.wallet.balance}
				{/snippet}

				<WalletBalanceById display="inline" ledgerId={CYCLES_LEDGER_CANISTER_ID} {selectedWallet} />
			</Value>
		</div>

		{#if nonNullish(selectedWallet)}
			<WalletIds {selectedWallet} />

			<div class="actions">
				<WalletActions onreceive={openReceive} onsend={() => (visible = false)} {selectedWallet} />
			</div>
		{/if}
	</div>
</Popover>

{#if nonNullish(selectedWallet)}
	<ReceiveTokens {selectedWallet} bind:visible={receiveVisible} />
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

	.picker {
		padding: var(--padding-0_5x) 0 0;

		:global(select) {
			margin: var(--padding-0_5x) 0;
			width: fit-content;
		}
	}
</style>
