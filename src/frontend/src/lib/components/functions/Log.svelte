<script lang="ts">
	import type { canister_log_record } from '$declarations/ic/ic.did';
	import { formatToDate } from '$lib/utils/date.utils';
	import { onMount } from 'svelte';
	import { isNullish } from '@dfinity/utils';

	export let log: canister_log_record;

	let content: string | undefined;
	onMount(async () => {
		const blob: Blob = new Blob([
			log.content instanceof Uint8Array ? log.content : new Uint8Array(log.content)
		]);
		content = await blob.text();
	});
</script>

<tr>
	<td>{formatToDate(log.timestamp_nanos)}</td>
	<td>
		{#if isNullish(content)}&ZeroWidthSpace;{:else}{content}{/if}
	</td>
</tr>
