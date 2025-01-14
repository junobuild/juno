<script lang="ts">
	import { AccountIdentifier } from '@dfinity/ledger-icp';
	import type { Principal } from '@dfinity/principal';
	import { nonNullish } from '@dfinity/utils';
	import { getAccountIdentifier } from '$lib/api/icp-index.api';
	import Identifier from '$lib/components/ui/Identifier.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { formatICP } from '$lib/utils/icp.utils';

	interface Props {
		missionControlId: Principal;
		balance: bigint | undefined;
	}

	let { missionControlId, balance }: Props = $props();

	let accountIdentifier: AccountIdentifier | undefined = $derived(
		getAccountIdentifier(missionControlId)
	);
</script>

<div class="card-container with-title from">
	<span class="title">{$i18n.core.from}</span>

	<div class="content">
		<Value>
			{#snippet label()}
				{$i18n.wallet.wallet_id}
			{/snippet}
			<p class="identifier">
				<Identifier shorten={false} identifier={missionControlId.toText()} />
			</p>
		</Value>

		<Value>
			{#snippet label()}
				{$i18n.wallet.account_identifier}
			{/snippet}
			<p class="identifier">
				<Identifier identifier={accountIdentifier?.toHex() ?? ''} />
			</p>
		</Value>

		<Value>
			{#snippet label()}
				{$i18n.wallet.balance}
			{/snippet}
			<p>
				{#if nonNullish(balance)}<span>{formatICP(balance)} <small>ICP</small></span>{/if}
			</p>
		</Value>
	</div>
</div>

<style lang="scss">
	.from {
		grid-row-start: 1;
		grid-row-end: 3;
	}
</style>
