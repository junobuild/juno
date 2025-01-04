<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

<div class="checkbox">
	{@render children()}
</div>

<style lang="scss">
	.checkbox {
		display: flex;
		align-items: center;
		gap: var(--padding-1_5x);

		:global(input[type='checkbox']) {
			margin: 0;
		}

		:global(span) {
			white-space: pre-wrap;
		}
	}
</style>
