<script lang="ts">
	import Value from '$lib/components/ui/Value.svelte';
	import type { WalletId, WalletIdText } from '$lib/schemas/wallet.schema';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { decodeIcrcAccount } from '@icp-sdk/canisters/ledger/icrc';
	import { nonNullish } from '@dfinity/utils';
	import { devId } from '$lib/derived/dev.derived';
	import { missionControlId } from '$lib/derived/console/account.mission-control.derived';

	interface Props {
		walletId: WalletId | undefined;
	}

	let { walletId = $bindable(undefined) }: Props = $props();

	let walletIdText = $state<WalletIdText | undefined>(undefined);

	$effect(() => {
		walletId = nonNullish(walletIdText) ? (decodeIcrcAccount(walletIdText) as WalletId) : undefined;
	});
</script>

<div>
	<Value ref="wallet-id">
		{#snippet label()}
			{$i18n.wallet.title}
		{/snippet}

		<select id="wallet-id" name="wallet-id" bind:value={walletIdText}>
			{#if nonNullish($devId)}<option value={$devId.toText()}>{$i18n.wallet.dev}</option>{/if}
			{#if nonNullish($missionControlId)}<option value={$missionControlId.toText()}
					>{$i18n.mission_control.title}</option
				>{/if}
		</select>
	</Value>
</div>
