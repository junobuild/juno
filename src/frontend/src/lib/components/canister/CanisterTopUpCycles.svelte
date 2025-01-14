<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { formatTCycles } from '$lib/utils/cycles.utils.js';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/i18n.store';

	interface Props {
		cycles: number | undefined;
	}

	let { cycles }: Props = $props();
</script>

<Value>
	{#snippet label()}
		{$i18n.canisters.converted_cycles}
	{/snippet}

	<p>{nonNullish(cycles) ? `${formatTCycles(BigInt(cycles ?? 0))}` : '0'} <small>TCycles</small></p>
</Value>
