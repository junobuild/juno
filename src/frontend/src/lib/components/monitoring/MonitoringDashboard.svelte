<script lang="ts">
	import { isNullish } from '@dfinity/utils';
	import { fade } from 'svelte/transition';
	import NoMonitoring from '$lib/components/monitoring/NoMonitoring.svelte';
	import SpinnerParagraph from '$lib/components/ui/SpinnerParagraph.svelte';
	import {
		missionControlSettings,
		missionControlSettingsNotLoaded
	} from '$lib/derived/mission-control.derived';
	import { i18n } from '$lib/stores/i18n.store';
	import type {Principal} from "@dfinity/principal";

	interface Props {
		missionControlId: Principal;
	}

	let { missionControlId }: Props = $props();
</script>

{#if $missionControlSettingsNotLoaded}
	<SpinnerParagraph>{$i18n.monitoring.loading}</SpinnerParagraph>
{:else if isNullish($missionControlSettings)}
	<div in:fade>
		<NoMonitoring {missionControlId} />
	</div>
{:else}
	<div in:fade>TODO</div>
{/if}
