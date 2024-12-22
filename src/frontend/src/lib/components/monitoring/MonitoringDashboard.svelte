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
</script>

{#if $missionControlSettingsNotLoaded}
	<SpinnerParagraph>{$i18n.core.loading}</SpinnerParagraph>
{:else if isNullish($missionControlSettings)}
	<div in:fade>
		<NoMonitoring />
	</div>
{:else}
	<div in:fade>TODO</div>
{/if}
