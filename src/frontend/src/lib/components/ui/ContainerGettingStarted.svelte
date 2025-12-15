<script lang="ts">
	import type { Snippet } from 'svelte';
	import Container from '$lib/components/ui/Container.svelte';
	import { i18n } from '$lib/stores/app/i18n.store';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

<Container>
	{#snippet title()}{$i18n.core.getting_started}{/snippet}

	{@render children()}
</Container>
