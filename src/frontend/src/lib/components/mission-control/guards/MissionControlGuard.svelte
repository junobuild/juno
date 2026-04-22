<script lang="ts">
	import type { Snippet } from 'svelte';
	import MissionControlNew from '$lib/components/mission-control/create/MissionControlNew.svelte';
	import SpinnerParagraph from '$lib/components/ui/SpinnerParagraph.svelte';
	import { missionControlId } from '$lib/derived/console/account.mission-control.derived';
	import { i18n } from '$lib/stores/app/i18n.store';
	import type { MissionControlId } from '$lib/types/mission-control';

	interface Props {
		content: Snippet<[MissionControlId]>;
	}

	let { content }: Props = $props();
</script>

{#if $missionControlId === undefined}
	<SpinnerParagraph>{$i18n.mission_control.loading}</SpinnerParagraph>
{:else if $missionControlId === null}
	<MissionControlNew />
{:else}
	{@render content($missionControlId)}
{/if}
