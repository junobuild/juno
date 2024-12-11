<script lang="ts">
	import type { Snippet } from 'svelte';
	import Spinner from '$lib/components/ui/Spinner.svelte';

	import { missionControlStore } from '$lib/derived/mission-control.derived';
	import { i18n } from '$lib/stores/i18n.store';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

{#if $missionControlStore === undefined}
	<Spinner />
{:else if $missionControlStore === null}
	<p>{$i18n.mission_control.not_found}</p>
{:else}
	{@render children()}
{/if}
