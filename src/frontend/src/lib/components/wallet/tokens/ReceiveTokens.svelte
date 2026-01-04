<script lang="ts">
	import { encodeIcrcAccount } from '@icp-sdk/canisters/ledger/icrc';
	import { fade } from 'svelte/transition';
	import IconOisy from '$lib/components/icons/IconOisy.svelte';
	import IconQRCode from '$lib/components/icons/IconQRCode.svelte';
	import Popover from '$lib/components/ui/Popover.svelte';
	import ReceiveTokensQRCode from '$lib/components/wallet/tokens/ReceiveTokensQRCode.svelte';
	import ReceiveTokensSigner from '$lib/components/wallet/tokens/ReceiveTokensSigner.svelte';
	import type { SelectedWallet } from '$lib/schemas/wallet.schema';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { toAccountIdentifier } from '$lib/utils/icp-icrc-account.utils';
	import { isNotSkylab } from '$lib/env/app.env';

	interface Props {
		selectedWallet: SelectedWallet;
		visible?: boolean;
	}

	let { selectedWallet, visible = $bindable(false) }: Props = $props();

	let { walletId } = $derived(selectedWallet);

	let walletIdText = $derived(encodeIcrcAccount(walletId));
	let accountIdentifier = $derived(toAccountIdentifier(walletId));

	let step: 'options' | 'wallet_id' | 'account_identifier' | 'signer' = $state('options');

	$effect(() => {
		visible;
		step = 'options';
	});
</script>

<Popover backdrop="dark" center={true} bind:visible>
	<div class="container">
		<h3>{$i18n.wallet.receive}</h3>

		{#if step === 'wallet_id'}
			<div in:fade>
				<ReceiveTokensQRCode
					ariaLabel={$i18n.wallet.wallet_id}
					back={() => (step = 'options')}
					value={walletIdText}
				/>
			</div>
		{:else if step === 'account_identifier'}
			<div in:fade>
				<ReceiveTokensQRCode
					ariaLabel={$i18n.wallet.account_identifier}
					back={() => (step = 'options')}
					value={accountIdentifier.toHex()}
				/>
			</div>
		{:else if step === 'signer'}
			<div in:fade>
				<ReceiveTokensSigner back={() => (step = 'options')} {walletId} bind:visible />
			</div>
		{:else}
			<div class="options">
				<button onclick={() => (step = 'wallet_id')}><IconQRCode /> {$i18n.wallet.wallet_id}</button
				>

				{#if selectedWallet.type === 'mission_control'}
					<button onclick={() => (step = 'account_identifier')}
						><IconQRCode /> {$i18n.wallet.account_identifier}</button
					>
				{/if}

				{#if isNotSkylab()}
					<p>{$i18n.wallet.or_connect_wallet}</p>

					<button onclick={() => (step = 'signer')}><IconOisy /> OISY</button>
				{/if}
			</div>
		{/if}
	</div>
</Popover>

<style lang="scss">
	@use '../../../styles/mixins/overlay';

	@include overlay.popover-container;

	.options {
		display: flex;
		flex-direction: column;
	}

	button {
		display: flex;
		justify-content: flex-start;
		gap: var(--padding);

		width: 100%;
	}

	p {
		font-size: var(--font-size-small);
		text-align: center;

		padding: var(--padding-2x) 0 0;
		margin: 0 0 var(--padding-1_5x);
	}
</style>
