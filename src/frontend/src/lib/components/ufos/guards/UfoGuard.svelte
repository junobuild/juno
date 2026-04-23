<script lang="ts">
	import type { Snippet } from 'svelte';
	import { fade } from 'svelte/transition';
	import NotFound from '$lib/components/ui/NotFound.svelte';
	import SpinnerParagraph from '$lib/components/ui/SpinnerParagraph.svelte';
	import { ufo } from '$lib/derived/ufo.derived';
	import { ufos } from '$lib/derived/ufos.derived';
	import { i18n } from '$lib/stores/app/i18n.store';
	import type { Ufo } from '$lib/types/ufo';

	interface Props {
		content: Snippet<[Ufo]>;
	}

	let { content }: Props = $props();
</script>

{#if $ufos === undefined || $ufo === undefined}
	<SpinnerParagraph>{$i18n.ufo.loading_ufos}</SpinnerParagraph>
{:else if $ufo === null}
	<div in:fade>
		<NotFound warnText={$i18n.errors.ufo_not_found} />
	</div>
{:else}
	{@render content($ufo)}
{/if}
