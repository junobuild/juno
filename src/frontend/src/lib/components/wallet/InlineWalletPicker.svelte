<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { decodeIcrcAccount } from '@icp-sdk/canisters/ledger/icrc';
	import { untrack } from 'svelte';
	import IconSwap from '$lib/components/icons/IconSwap.svelte';
	import { missionControlId } from '$lib/derived/console/account.mission-control.derived';
	import { devId } from '$lib/derived/dev.derived';
	import { missionControlHasIcp } from '$lib/derived/wallet/balance.derived';
	import type { SelectedWallet, WalletId, WalletIdText } from '$lib/schemas/wallet.schema';
	import { i18n } from '$lib/stores/app/i18n.store';

	interface Props {
		selectedWallet: SelectedWallet | undefined;
	}

	let { selectedWallet = $bindable(undefined) }: Props = $props();

	let walletIdText = $state<WalletIdText | undefined>($devId?.toText());

	$effect(() => {
		walletIdText;

		untrack(() => {
			selectedWallet = nonNullish(walletIdText)
				? walletIdText === $devId?.toText()
					? { type: 'dev', walletId: decodeIcrcAccount(walletIdText) as WalletId }
					: walletIdText === $missionControlId?.toText()
						? { type: 'mission_control', walletId: decodeIcrcAccount(walletIdText) as WalletId }
						: undefined
				: undefined;
		});
	});

	let pickerEnabled = $derived(nonNullish($missionControlId) && $missionControlHasIcp);

	const toggleWallet = () => {
		walletIdText =
			nonNullish($missionControlId) && walletIdText === $missionControlId.toText()
				? $devId?.toText()
				: $missionControlId?.toText();
	};
</script>

{#snippet devWallet()}
	{$i18n.wallet.dev}
{/snippet}

{#snippet walletWithToggle()}
	{nonNullish($missionControlId) && walletIdText === $missionControlId.toText()
		? $i18n.mission_control.title
		: $i18n.wallet.dev}
	<button class="square" aria-label={$i18n.wallet.toggle_wallet} onclick={toggleWallet}
		><IconSwap size="16" />
	</button>
{/snippet}

{#if pickerEnabled}
	{@render walletWithToggle()}
{:else}
	{@render devWallet()}
{/if}

<style lang="scss">
	button {
		vertical-align: bottom;
	}
</style>
