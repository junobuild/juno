<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		action?: Snippet;
	}

	let { children, action }: Props = $props();
</script>

<div class="container">
	{@render children()}

	{#if nonNullish(action)}
		<div class="action">
			{@render action()}
		</div>
	{/if}
</div>

<style lang="scss">
	.container {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;

		text-align: center;

		min-height: calc(100vh - var(--header-height) - var(--padding-8x));
		padding: 0 0 var(--padding-12x);
	}

	.action {
		padding: var(--padding) 0 0;
	}
</style>
