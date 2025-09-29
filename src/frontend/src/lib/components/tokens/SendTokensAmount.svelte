<script lang="ts">
	import { nonNullish, type TokenAmountV2 } from '@dfinity/utils';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { formatICP, formatICPToUsd } from '$lib/utils/icp.utils';
	import { icpToUsd } from '$lib/derived/exchange.derived';

	interface Props {
		token: TokenAmountV2 | undefined;
	}

	let { token }: Props = $props();
</script>

<Value>
	{#snippet label()}
		{$i18n.core.amount}
	{/snippet}

	<p>
		{#if nonNullish(token)}<span>{formatICP(token.toE8s())} <small>ICP</small></span>{/if}

		{#if nonNullish($icpToUsd) && nonNullish(token)}
			<span class="usd">{formatICPToUsd({ icp: token.toE8S(), icpToUsd: $icpToUsd })}</span>
		{/if}
	</p>
</Value>

<style lang="scss">
	.usd {
		display: block;
		font-size: var(--font-size-small);
	}
</style>
