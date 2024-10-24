<script lang="ts">
	import Spinner from '$lib/components/ui/Spinner.svelte';
	import { missionControlStore } from '$lib/stores/mission-control.store';

	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
</script>

{#if $missionControlStore === undefined}
	<Spinner />
{:else if $missionControlStore === null}
	<p>Mission control not found.</p>
{:else}
	{@render children?.()}
{/if}
