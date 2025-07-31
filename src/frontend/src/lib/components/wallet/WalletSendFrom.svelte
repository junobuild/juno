<script lang="ts">
	import type { AccountIdentifier } from '@dfinity/ledger-icp';
	import { nonNullish } from '@dfinity/utils';
	import { getAccountIdentifier } from '$lib/api/icp-index.api';
	import Identifier from '$lib/components/ui/Identifier.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import { icpToUsd } from '$lib/derived/exchange.derived';
	import { i18n } from '$lib/stores/i18n.store';
	import type { MissionControlId } from '$lib/types/mission-control';
	import { formatICP, formatICPToUsd } from '$lib/utils/icp.utils';

	interface Props {
		missionControlId: MissionControlId;
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
				<Identifier identifier={missionControlId.toText()} shorten={false} />
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
				{#if nonNullish(balance)}
					<span>{formatICP(balance)} <small>ICP</small></span>

					{#if nonNullish($icpToUsd)}
						<span class="usd">{formatICPToUsd({ icp: balance, icpToUsd: $icpToUsd })}</span>
					{/if}
				{/if}
			</p>
		</Value>
	</div>
</div>

<style lang="scss">
	.from {
		grid-row-start: 1;
		grid-row-end: 3;
	}

	.usd {
		display: block;
		font-size: var(--font-size-small);
	}
</style>
