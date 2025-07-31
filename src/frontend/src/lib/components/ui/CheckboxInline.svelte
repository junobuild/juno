<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		checked: boolean;
		children: Snippet;
	}

	let { checked = $bindable(true), children }: Props = $props();
</script>

<div class="options">
	<input {checked} onchange={() => (checked = !checked)} type="checkbox" />
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
