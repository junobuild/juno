<script lang="ts">
	import { nonNullish, type TokenAmountV2 } from '@dfinity/utils';
	import { formatICP } from '$lib/utils/icp.utils';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/i18n.store';

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
	</p>
</Value>
