<script lang="ts">
	import type { Snippet } from 'svelte';
	import MissionControlNew from '$lib/components/mission-control/create/MissionControlNew.svelte';
	import SpinnerParagraph from '$lib/components/ui/SpinnerParagraph.svelte';
	import { missionControlId } from '$lib/derived/console/account.mission-control.derived';
	import { i18n } from '$lib/stores/app/i18n.store';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

{#if $missionControlId === undefined}
	<SpinnerParagraph>{$i18n.mission_control.loading}</SpinnerParagraph>
{:else if $missionControlId === null}
	<MissionControlNew />
{:else}
	{@render children()}
{/if}
