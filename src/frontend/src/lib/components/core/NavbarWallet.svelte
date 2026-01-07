<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import IconWallet from '$lib/components/icons/IconWallet.svelte';
	import ButtonIcon from '$lib/components/ui/ButtonIcon.svelte';
	import Hr from '$lib/components/ui/Hr.svelte';
	import Popover from '$lib/components/ui/Popover.svelte';
	import WalletActions from '$lib/components/wallet/WalletActions.svelte';
	import WalletPicker from '$lib/components/wallet/WalletPicker.svelte';
	import WalletTokenPicker from '$lib/components/wallet/WalletTokenPicker.svelte';
	import WalletBalanceById from '$lib/components/wallet/balance/WalletBalanceById.svelte';
	import WalletTotal from '$lib/components/wallet/balance/WalletTotal.svelte';
	import ReceiveTokens from '$lib/components/wallet/tokens/ReceiveTokens.svelte';
	import { testIds } from '$lib/constants/test-ids.constants';
	import { CYCLES } from '$lib/constants/token.constants';
	import { missionControlId } from '$lib/derived/console/account.mission-control.derived';
	import { devHasIcp } from '$lib/derived/wallet/balance.derived';
	import type { SelectedToken, SelectedWallet } from '$lib/schemas/wallet.schema';
	import { i18n } from '$lib/stores/app/i18n.store';
	import IconInfo from '$lib/components/icons/IconInfo.svelte';

	let button: HTMLButtonElement | undefined = $state();
	let visible: boolean = $state(false);

	const onclick = () => (visible = true);
	const onclose = () => (visible = false);

	let receiveVisible = $state(false);

	const openReceive = () => {
		visible = false;
		receiveVisible = true;
	};

	let selectedWallet = $state<SelectedWallet | undefined>(undefined);
	let selectedToken = $state<SelectedToken>(CYCLES);

	let detailed = $derived(nonNullish($missionControlId) || $devHasIcp);
</script>

<ButtonIcon {onclick} testId={testIds.navbar.openWallet} bind:button>
	{#snippet icon()}
		<IconWallet size="16px" />
	{/snippet}

	{$i18n.wallet.title}
</ButtonIcon>

<Popover anchor={button} direction="rtl" bind:visible>
	<div class="container">
		<div class="info">
			<a
				aria-label={$i18n.wallet.information}
				href="https://juno.build/docs/miscellaneous/wallet"
				rel="noreferrer noopener"
				tabindex="-1"
				target="_blank"><IconInfo size="20px" /></a
			>
		</div>

		<div>
			<WalletTotal />
		</div>

		<div class="picker selected-wallet">
			<WalletPicker bind:selectedWallet />
		</div>

		<div class="picker token-selector">
			<WalletTokenPicker {selectedWallet} bind:selectedToken />
		</div>

		{#if detailed}
			<div>
				<WalletBalanceById highlight={false} {selectedToken} {selectedWallet} />
			</div>
		{/if}

		{#if nonNullish(selectedWallet)}
			<div class="actions">
				<WalletActions onreceive={openReceive} onsend={onclose} {selectedToken} {selectedWallet} />
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

	.selected-wallet {
		padding: var(--padding-0_5x) 0 0;
	}

	.token-selector {
		:global(div.picker) {
			margin: 0 0 var(--padding-0_5x);
		}
	}

	.picker {
		:global(select) {
			margin: var(--padding-0_5x) 0;
			width: fit-content;
		}
	}

	.info {
		display: flex;
		justify-content: flex-end;

		a {
			display: flex;
			justify-content: center;
			align-items: center;
		}
	}
</style>
