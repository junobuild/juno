<script lang="ts">
	import { satelliteStore } from '$lib/stores/satellite.store';
	import Spinner from '$lib/components/ui/Spinner.svelte';
	import { i18n } from '$lib/stores/i18n.store';
</script>

{#if $satelliteStore === undefined}
	<Spinner />
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
