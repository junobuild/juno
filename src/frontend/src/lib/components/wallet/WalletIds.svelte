<script lang="ts">
	import { quintOut } from 'svelte/easing';
	import { slide } from 'svelte/transition';
	import { encodeIcrcAccount } from '@icp-sdk/canisters/ledger/icrc';
	import Identifier from '$lib/components/ui/Identifier.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import type { SelectedWallet } from '$lib/schemas/wallet.schema';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { toAccountIdentifier } from '$lib/utils/icp-icrc-account.utils';
	import {missionControlHasIcp} from "$lib/derived/wallet/balance.derived";

	interface Props {
		selectedWallet: SelectedWallet;
	}

	let { selectedWallet }: Props = $props();

	let { walletId } = $derived(selectedWallet);

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

{#if selectedWallet.type === 'mission_control' && $missionControlHasIcp}
	<div transition:slide={{ delay: 0, duration: 150, easing: quintOut, axis: 'y' }}>
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
{/if}
