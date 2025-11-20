<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		checked: boolean;
		children: Snippet;
	}

	let { checked = $bindable(true), children }: Props = $props();
</script>

<label class="options">
	<input {checked} onchange={() => (checked = !checked)} type="checkbox" />
	<span>
		{@render children()}
	</span>
</label>

<style lang="scss">
	input[type='checkbox'] {
		margin: 0;
	}

	.options {
		display: block;
		margin: var(--padding) var(--padding-0_5x) 0;
	}
</style>
