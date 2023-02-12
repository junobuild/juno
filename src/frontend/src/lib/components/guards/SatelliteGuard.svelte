<script lang="ts">
	import { satelliteStore } from '$lib/stores/satellite.store';
	import { i18n } from '$lib/stores/i18n.store';
	import Spinner from '$lib/components/ui/Spinner.svelte';
</script>

{#if $satelliteStore === undefined}
	<p class="label loading">{$i18n.satellites.loading_satellites} <Spinner inline /></p>
{:else if $satelliteStore === null}
	<p class="label">{@html $i18n.errors.satellite_no_found}</p>
{:else}
	<slot />
{/if}

<style lang="scss">
	.loading {
		display: flex;
		gap: var(--padding);
		align-items: center;
		--spinner-size: 1rem;
	}

	p {
		margin-top: var(--padding-3x);
		color: var(--value-color);
	}
</style>
