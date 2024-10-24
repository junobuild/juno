<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import { onMount } from 'svelte';
	import { sanitize } from '$lib/utils/html.utils';

	interface Props {
		text?: string | undefined;
	}

	let { text = undefined }: Props = $props();

	// force to rerender after SSR
	let mounted = $state(false);
	onMount(() => (mounted = true));
</script>

{#if mounted && nonNullish(text)}
	<!-- eslint-disable svelte/no-at-html-tags -->
	{@html sanitize(text)}
{/if}
