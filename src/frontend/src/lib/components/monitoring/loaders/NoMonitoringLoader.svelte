<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { CanisterSegment } from '$lib/types/canister';

	interface Props {
		children: Snippet;
		segments: CanisterSegment[];
	}

	let { children, segments: _ }: Props = $props();
</script>

{@render children()}
