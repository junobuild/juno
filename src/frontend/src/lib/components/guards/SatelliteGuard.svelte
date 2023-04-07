<script lang="ts">
	import { satelliteStore } from '$lib/stores/satellite.store';
	import { i18n } from '$lib/stores/i18n.store';
	import SpinnerParagraph from '$lib/components/ui/SpinnerParagraph.svelte';
</script>

{#if $satelliteStore === undefined}
	<SpinnerParagraph>{$i18n.satellites.loading_satellites}</SpinnerParagraph>
{:else if $satelliteStore === null}
	<p class="label">{@html $i18n.errors.satellite_no_found}</p>
{:else}
	<slot />
{/if}

<style lang="scss">
	p {
		margin-top: var(--padding-3x);
		color: var(--value-color);
	}
</style>
