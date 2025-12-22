<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { decodeIcrcAccount } from '@icp-sdk/canisters/ledger/icrc';
	import { untrack } from 'svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { missionControlId } from '$lib/derived/console/account.mission-control.derived';
	import { devId } from '$lib/derived/dev.derived';
	import { missionControlBalanceOrZero } from '$lib/derived/wallet/balance.derived';
	import type { SelectedWallet, WalletId, WalletIdText } from '$lib/schemas/wallet.schema';
	import { i18n } from '$lib/stores/app/i18n.store';

	interface Props {
		selectedWallet: SelectedWallet | undefined;
		filterMissionControlZeroBalance?: boolean;
	}

	let { selectedWallet = $bindable(undefined), filterMissionControlZeroBalance = false }: Props =
		$props();

	let walletIdText = $state<WalletIdText | undefined>(undefined);

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
</script>

<div>
	<Value ref="wallet-id">
		{#snippet label()}
			{$i18n.wallet.title}
		{/snippet}

		<select id="wallet-id" name="wallet-id" bind:value={walletIdText}>
			{#if nonNullish($devId)}<option value={$devId.toText()}>{$i18n.wallet.dev}</option>{/if}
			{#if nonNullish($missionControlId) && (!filterMissionControlZeroBalance || $missionControlBalanceOrZero > 0n)}<option
					value={$missionControlId.toText()}>{$i18n.mission_control.title}</option
				>{/if}
		</select>
	</Value>
</div>
