<script lang="ts">
	import { i18n } from '$lib/stores/app/i18n.store';
	import Container from '$lib/components/ui/Container.svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

<Container>
	{#snippet title()}{$i18n.core.getting_started}{/snippet}

	{@render children()}
</Container>
