<script lang="ts">
	import type { Snippet } from 'svelte';
	import { fade } from 'svelte/transition';
	import Html from '$lib/components/ui/Html.svelte';
	import Info from '$lib/components/ui/Info.svelte';
	import SpinnerParagraph from '$lib/components/ui/SpinnerParagraph.svelte';
	import { satelliteStore } from '$lib/derived/satellite.derived';
	import { satellitesStore } from '$lib/derived/satellites.derived';
	import { i18n } from '$lib/stores/i18n.store';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

{#if $satellitesStore === undefined}
	<SpinnerParagraph>{$i18n.satellites.loading_satellites}</SpinnerParagraph>
{:else if $satelliteStore === null}
	<p class="label" in:fade><Info><Html text={$i18n.errors.satellite_no_found} /></Info></p>

	<a class="button" href="/" in:fade>{$i18n.satellites.go_launchpad}</a>
{:else}
	{@render children()}
{/if}

<style lang="scss">
	p {
		margin: var(--padding-3x) 0 0;
		color: var(--value-color);
	}

	.button {
		margin: 0;
	}
</style>
