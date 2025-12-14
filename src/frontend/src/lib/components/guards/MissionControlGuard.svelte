<script lang="ts">
	import type { Snippet } from 'svelte';
	import MissionControlNew from '$lib/components/mission-control/MissionControlNew.svelte';
	import ContainerGettingStarted from '$lib/components/ui/ContainerGettingStarted.svelte';
	import SpinnerParagraph from '$lib/components/ui/SpinnerParagraph.svelte';
	import { missionControlId } from '$lib/derived/console/account.mission-control.derived';
	import { i18n } from '$lib/stores/app/i18n.store';

	interface Props {
		children: Snippet;
		notFoundDescription?: string;
	}

	let { children, notFoundDescription }: Props = $props();
</script>

{#if $missionControlId === undefined}
	<SpinnerParagraph>{$i18n.mission_control.loading}</SpinnerParagraph>
{:else if $missionControlId === null}
	<ContainerGettingStarted>
		{notFoundDescription ?? $i18n.mission_control.empty}
	</ContainerGettingStarted>

	<MissionControlNew />
{:else}
	{@render children()}
{/if}
