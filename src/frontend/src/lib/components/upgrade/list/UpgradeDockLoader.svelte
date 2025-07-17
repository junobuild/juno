<script lang="ts">
	import type { Snippet } from 'svelte';
	import SpinnerParagraph from '$lib/components/ui/SpinnerParagraph.svelte';
	import {
		missionControlVersionNotLoaded,
		orbiterVersionNotLoaded,
		satellitesVersionNotLoaded
	} from '$lib/derived/version.derived';
	import { i18n } from '$lib/stores/i18n.store';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	let loading = $derived(
		$missionControlVersionNotLoaded || $orbiterVersionNotLoaded || $satellitesVersionNotLoaded
	);
</script>

{#if loading}
	<div class="loading">
		<SpinnerParagraph>{$i18n.core.loading}</SpinnerParagraph>
	</div>
{:else}
	{@render children()}
{/if}
