<script lang="ts">
	import type { IcrcAccount } from '@dfinity/oisy-wallet-signer';
	import { base64ToUint8Array, nonNullish } from '@dfinity/utils';
	import { Principal } from '@icp-sdk/core/principal';
	import { untrack } from 'svelte';
	import { getUncertifiedBalance } from '$lib/api/icrc-ledger.api';
	import Identifier from '$lib/components/ui/Identifier.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import SkeletonText from '$lib/components/ui/SkeletonText.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import WalletTokenPicker from '$lib/components/wallet/WalletTokenPicker.svelte';
	import TokenSymbol from '$lib/components/wallet/tokens/TokenSymbol.svelte';
	import { CYCLES } from '$lib/constants/token.constants';
	import { authIdentity } from '$lib/derived/auth.derived';
	import type { SelectedToken, SelectedWallet } from '$lib/schemas/wallet.schema';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { toasts } from '$lib/stores/app/toasts.store';
	import { formatToken } from '$lib/utils/token.utils';

	interface Props {
		selectedWallet: SelectedWallet;
		selectedToken: SelectedToken;
		account: IcrcAccount;
		back: () => void;
		receive: (params: { balance: bigint | undefined; amount: string }) => Promise<void>;
	}

	let {
		account,
		selectedWallet,
		selectedToken = $bindable(CYCLES),
		back,
		receive
	}: Props = $props();

	let balance: bigint | undefined = $state(undefined);
	let amount = $state('');

	const loadBalance = async (account: IcrcAccount) => {
		try {
			const owner = Principal.fromText(account.owner);
			const subaccount = nonNullish(account.subaccount)
				? base64ToUint8Array(account.subaccount)
				: undefined;

			balance = await getUncertifiedBalance({
				account: { owner, subaccount },
				identity: $authIdentity,
				ledgerId: Principal.fromText(selectedToken.ledgerId)
			});
		} catch (err: unknown) {
			toasts.error({
				text: $i18n.errors.wallet_load_balance,
				detail: err
			});

			back();
		}
	};

	$effect(() => {
		selectedToken;
		account;

		untrack(() => {
			loadBalance(account);
		});
	});

	$effect(() => {
		selectedToken;

		untrack(() => {
			amount = '';
		});
	});

	const onsubmit = async ($event: SubmitEvent) => {
		$event.preventDefault();

		await receive({
			balance,
			amount
		});
	};
</script>

<form class="container" {onsubmit}>
	<div>
		<Value>
			{#snippet label()}
				OISY {$i18n.wallet.wallet_id}
			{/snippet}
			<Identifier identifier={account.owner} small={false} />
		</Value>
	</div>

	<WalletTokenPicker {selectedWallet} bind:selectedToken />

	<div class="balance">
		<Value ref="balance">
			{#snippet label()}
				{$i18n.wallet.balance}
			{/snippet}
			{#if nonNullish(balance)}
				<span
					>{formatToken({ selectedToken, amount: balance })}
					<TokenSymbol {selectedToken} /></span
				>
			{:else}
				<SkeletonText />
			{/if}
		</Value>
	</div>

	<div>
		<Value>
			{#snippet label()}
				{$i18n.core.icp_amount}
			{/snippet}
			<Input
				name="amount"
				inputType="currency"
				placeholder={$i18n.wallet.amount_placeholder}
				required
				spellcheck={false}
				bind:value={amount}
			/>
		</Value>
	</div>

	<div class="toolbar">
		<button onclick={back}>{$i18n.core.back}</button>

		<button type="submit">
			{$i18n.core.request}
		</button>
	</div>
</form>

<style lang="scss">
	.container {
		padding: var(--padding-2x) 0 0;
	}

	.balance {
		min-height: 68px;
		padding: 0 0 var(--padding-2x);
	}

	button {
		margin: var(--padding-2x) 0 0;
	}
</style>
