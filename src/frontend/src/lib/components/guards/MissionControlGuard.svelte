<script lang="ts">
	import Spinner from '$lib/components/ui/Spinner.svelte';
	import { missionControlStore } from '$lib/stores/mission-control.store';
</script>

{#if $missionControlStore === undefined}
	<Spinner />
{:else if $missionControlStore === null}
	<p>Mission control not found.</p>
{:else}
	<slot />
{/if}
