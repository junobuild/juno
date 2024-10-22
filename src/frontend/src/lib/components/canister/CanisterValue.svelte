<script lang="ts">
	import SkeletonText from '$lib/components/ui/SkeletonText.svelte';
	import Value from '$lib/components/ui/Value.svelte';
	import type { CanisterSyncStatus } from '$lib/types/canister';

	export let sync: CanisterSyncStatus | undefined;
	export let rows = 1;

	let paragraphs: number[];
	$: paragraphs = Array.from({ length: rows }, (_, i) => i);
</script>

<Value>
	<slot slot="label" name="label" />
	{#if ['synced', 'syncing'].includes(sync ?? '')}
		<slot />
	{:else if sync === 'loading'}
		{#each paragraphs as _}
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
