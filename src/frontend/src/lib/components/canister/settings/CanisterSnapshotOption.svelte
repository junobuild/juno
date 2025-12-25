<script lang="ts">
	import type { Snippet } from 'svelte';
	import CheckboxInline from '$lib/components/ui/CheckboxInline.svelte';

	interface Props {
		takeSnapshot: boolean;
		children: Snippet;
	}

	let { takeSnapshot = $bindable(true), children }: Props = $props();
</script>

<CheckboxInline bind:checked={takeSnapshot}>
	{@render children()}
</CheckboxInline>
