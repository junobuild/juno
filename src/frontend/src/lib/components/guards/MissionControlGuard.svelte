<script lang="ts">
	import type { Snippet } from 'svelte';
	import { missionControlStore } from '$lib/derived/mission-control.derived';
	import { i18n } from '$lib/stores/i18n.store';
	import SpinnerParagraph from "$lib/components/ui/SpinnerParagraph.svelte";

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

{#if $missionControlStore === undefined}
	<SpinnerParagraph>{$i18n.mission_control.loading}</SpinnerParagraph>
{:else if $missionControlStore === null}
	<p>{$i18n.mission_control.not_found}</p>
{:else}
	{@render children()}
{/if}
