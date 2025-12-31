<script lang="ts">
	import { nonNullish, type TokenAmountV2 } from '@dfinity/utils';
	import Value from '$lib/components/ui/Value.svelte';
	import TokenSymbol from '$lib/components/wallet/tokens/TokenSymbol.svelte';
	import TokenUsd from '$lib/components/wallet/tokens/TokenUsd.svelte';
	import type { SelectedToken } from '$lib/schemas/wallet.schema';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { formatToken } from '$lib/utils/token.utils';

	interface Props {
		token: TokenAmountV2 | undefined;
		selectedToken: SelectedToken;
	}

	let { token, selectedToken }: Props = $props();
</script>

<Value>
	{#snippet label()}
		{$i18n.core.amount}
	{/snippet}

	<p>
		{#if nonNullish(token)}
			<span
				>{formatToken({ selectedToken, amount: token.toUlps() })}
				<TokenSymbol {selectedToken} /></span
			>

			<TokenUsd {selectedToken} {token} />
		{/if}
	</p>
</Value>
