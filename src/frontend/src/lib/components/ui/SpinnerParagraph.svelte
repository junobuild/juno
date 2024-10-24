<script lang="ts">
	import type { Snippet } from 'svelte';
	import Spinner from '$lib/components/ui/Spinner.svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

<p class="label loading">{@render children()} <Spinner inline /></p>

<style lang="scss">
	.loading {
		display: flex;
		gap: var(--padding);
		align-items: center;
		--spinner-size: 1rem;
	}

	p {
		margin: var(--spinner-paragraph-margin, var(--padding-3x) 0 0);
		color: var(--value-color);
	}
</style>
