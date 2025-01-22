<script lang="ts">
	import type { Snippet } from 'svelte';
	import Html from '$lib/components/ui/Html.svelte';
	import SpinnerParagraph from '$lib/components/ui/SpinnerParagraph.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { satelliteStore } from '$lib/derived/satellite.derived';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

{#if $satelliteStore === undefined}
	<SpinnerParagraph>{$i18n.satellites.loading_satellites}</SpinnerParagraph>
{:else if $satelliteStore === null}
	<p class="label"><Html text={$i18n.errors.satellite_no_found} /></p>
{:else}
	{@render children()}
{/if}

<style lang="scss">
	p {
		margin-top: var(--padding-3x);
		color: var(--value-color);
	}
</style>
