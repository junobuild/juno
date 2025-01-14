<script lang="ts">
	import type { IcrcAccount } from '@dfinity/oisy-wallet-signer';
	import { Principal } from '@dfinity/principal';
	import { nonNullish } from '@dfinity/utils';
	import { getBalance } from '$lib/api/icp-index.api';
	import Identifier from '$lib/components/ui/Identifier.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import SkeletonText from '$lib/components/ui/SkeletonText.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { authStore } from '$lib/stores/auth.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { toasts } from '$lib/stores/toasts.store';
	import { formatICP } from '$lib/utils/icp.utils';

	interface Props {
		account: IcrcAccount;
		back: () => void;
		receive: (params: { balance: bigint | undefined; amount: string }) => Promise<void>;
	}

	let { account, back, receive }: Props = $props();

	let owner: Principal = $derived(Principal.fromText(account.owner));

	let balance: bigint | undefined = $state(undefined);
	let amount = $state('');

	const loadBalance = async (owner: Principal) => {
		try {
			balance = await getBalance({ owner, identity: $authStore.identity });
		} catch (error: unknown) {
			toasts.error({
				text: $i18n.errors.wallet_load_balance
			});

			back();
		}
	};

	$effect(() => {
		loadBalance(owner);
	});

	const onsubmit = async () => {
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

	<div class="balance">
		<Value ref="balance">
			{#snippet label()}
				{$i18n.wallet.balance}
			{/snippet}
			{#if nonNullish(balance)}
				{formatICP(balance)} <small>ICP</small>
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
				required
				bind:value={amount}
				spellcheck={false}
				placeholder={$i18n.wallet.amount_placeholder}
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
