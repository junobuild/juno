<script lang="ts">
	import type { Snippet } from 'svelte';
	import SpinnerParagraph from '$lib/components/ui/SpinnerParagraph.svelte';
	import { missionControlIdDerived } from '$lib/derived/mission-control.derived';
	import { i18n } from '$lib/stores/i18n.store';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

{#if $missionControlIdDerived === undefined}
	<SpinnerParagraph>{$i18n.mission_control.loading}</SpinnerParagraph>
{:else if $missionControlIdDerived === null}
	<p>{$i18n.mission_control.not_found}</p>
{:else}
	{@render children()}
{/if}
