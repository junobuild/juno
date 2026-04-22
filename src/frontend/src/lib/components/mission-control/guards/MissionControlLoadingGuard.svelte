<script lang="ts">
	import type { Snippet } from 'svelte';
	import SpinnerParagraph from '$lib/components/ui/SpinnerParagraph.svelte';
	import { missionControlIdNotLoaded } from '$lib/derived/console/account.mission-control.derived';
	import { i18n } from '$lib/stores/app/i18n.store';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

{#if $missionControlIdNotLoaded}
	<SpinnerParagraph>{$i18n.mission_control.loading}</SpinnerParagraph>
{:else}
	{@render children()}
{/if}
