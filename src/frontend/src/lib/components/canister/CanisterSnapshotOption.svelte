<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		takeSnapshot: boolean;
		children: Snippet;
	}

	let { takeSnapshot = $bindable(true), children }: Props = $props();
</script>

<div class="options">
	<input type="checkbox" checked={takeSnapshot} onchange={() => (takeSnapshot = !takeSnapshot)} />
	<span>
		{@render children()}
	</span>
</div>

<style lang="scss">
	input[type='checkbox'] {
		margin: 0;
	}

	.options {
		margin: var(--padding) var(--padding-0_5x) 0;
	}
</style>
