<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import Value from '$lib/components/ui/Value.svelte';
	import { i18n } from '$lib/stores/app/i18n.store';
	import { formatTCycles } from '$lib/utils/cycles.utils';

	interface Props {
		cycles: bigint | undefined;
	}

	let { cycles }: Props = $props();
</script>

<Value>
	{#snippet label()}
		{$i18n.canisters.converted_cycles}
	{/snippet}

	<p>{nonNullish(cycles) ? `${formatTCycles(cycles ?? 0n)}` : '0'} <small>TCycles</small></p>
</Value>
