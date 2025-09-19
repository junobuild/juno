<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import type { Snippet } from 'svelte';
	import { fade } from 'svelte/transition';
	import DataActions from '$lib/components/data/DataActions.svelte';

	interface Props {
		children: Snippet;
		actions?: Snippet;
	}

	let { children, actions }: Props = $props();
</script>

<div class="actions">
	<span>{@render children()}</span>

	{#if nonNullish(actions)}
		<div>
			<DataActions>
				{@render actions?.()}
			</DataActions>
		</div>
	{/if}
</div>

<style lang="scss">
	.actions {
		display: flex;
		justify-content: space-between;
	}

	div {
		display: flex;
		gap: var(--padding-1_5x);
	}
</style>
