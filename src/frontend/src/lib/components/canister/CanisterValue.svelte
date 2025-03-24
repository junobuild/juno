<script lang="ts">
	import type { Snippet } from 'svelte';
	import SkeletonText from '$lib/components/ui/SkeletonText.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import type { CanisterSyncStatus } from '$lib/types/canister';

	interface Props {
		sync: CanisterSyncStatus | undefined;
		rows?: number;
		label: Snippet;
		children: Snippet;
	}

	let { sync, rows = 1, label, children }: Props = $props();

	let paragraphs: number[] = $derived(Array.from({ length: rows }, (_, i) => i));
</script>

<Value {label}>
	{#if ['synced', 'syncing'].includes(sync ?? '')}
		{@render children()}
	{:else if sync === 'loading'}
		{#each paragraphs as paragraph (paragraph)}
			<p><SkeletonText /></p>
		{/each}
	{:else}
		<p>&ZeroWidthSpace;</p>
	{/if}
</Value>

<style lang="scss">
	p {
		height: 24px;
	}
</style>
