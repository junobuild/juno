<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: Snippet;
		children: Snippet;
	}

	let { title, children }: Props = $props();
</script>

<div class="card-container with-title">
	<span class="title">{@render title()}</span>

	<div class="content">
		<p>{@render children()}</p>
	</div>
</div>

<style lang="scss">
	p {
		width: calc(100% - var(--padding-6x));
	}
</style>
