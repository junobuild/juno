<script lang="ts">
	import type { Snippet } from 'svelte';
	import { fade } from 'svelte/transition';
	import NotFound from '$lib/components/ui/NotFound.svelte';
	import SpinnerParagraph from '$lib/components/ui/SpinnerParagraph.svelte';
	import { satellite } from '$lib/derived/satellite.derived';
	import { satellites } from '$lib/derived/satellites.derived';
	import { i18n } from '$lib/stores/app/i18n.store';
	import type { Satellite } from '$lib/types/satellite';

	interface Props {
		content: Snippet<[Satellite]>;
	}

	let { content }: Props = $props();
</script>

{#if $satellites === undefined || $satellite === undefined}
	<SpinnerParagraph>{$i18n.satellites.loading_satellites}</SpinnerParagraph>
{:else if $satellite === null}
	<div in:fade>
		<NotFound warnText={$i18n.errors.satellite_no_found} />
	</div>
{:else}
	{@render content($satellite)}
{/if}
