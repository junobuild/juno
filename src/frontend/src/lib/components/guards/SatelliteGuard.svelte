<script lang="ts">
	import { satelliteStore } from '$lib/stores/satellite.store';
	import Spinner from '$lib/components/ui/Spinner.svelte';
</script>

{#if $satelliteStore === undefined}
	<Spinner />
{:else if $satelliteStore === null}
	<p>Satellite not found.</p>
{:else}
	<slot />
{/if}
