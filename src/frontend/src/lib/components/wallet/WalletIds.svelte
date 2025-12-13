<script lang="ts">
	import { encodeIcrcAccount } from '@icp-sdk/canisters/ledger/icrc';
	import Identifier from '$lib/components/ui/Identifier.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import type { WalletId, WalletIdText } from '$lib/schemas/wallet.schema';
	import { i18n } from '$lib/stores/app/i18n.store';
	import type { MissionControlId } from '$lib/types/mission-control';
	import { toAccountIdentifier } from '$lib/utils/icp-icrc-account.utils';

	interface Props {
		walletId: WalletId;
	}

	let { walletId }: Props = $props();

	let walletIdText = $derived(encodeIcrcAccount(walletId));

	let accountIdentifier = $derived(toAccountIdentifier(walletId));
</script>

<div>
	<Value>
		{#snippet label()}
			{$i18n.wallet.wallet_id}
		{/snippet}
		<Identifier
			identifier={walletIdText}
			shorten={false}
			small={false}
			what={$i18n.wallet.wallet_id}
		/>
	</Value>
</div>

<div>
	<Value>
		{#snippet label()}
			{$i18n.wallet.account_identifier}
		{/snippet}
		<Identifier
			identifier={accountIdentifier?.toHex() ?? ''}
			small={false}
			what={$i18n.wallet.account_identifier}
		/>
	</Value>
</div>
