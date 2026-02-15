<script lang="ts">
	import type { Snippet } from 'svelte';
	import { fade } from 'svelte/transition';
	import SpinnerParagraph from '$lib/components/ui/SpinnerParagraph.svelte';
	import { i18n } from '$lib/stores/app/i18n.store';
	import type { SatelliteDid } from '$declarations';
	import { satelliteAutomationConfig } from '$lib/derived/satellite/satellite-configs.derived';
	import NoAutomation from '$lib/components/satellites/automation/NoAutomation.svelte';
	import AutomationNew from '$lib/components/satellites/automation/AutomationNew.svelte';
	import type { Satellite } from '$lib/types/satellite';

	interface Props {
		satellite: Satellite;
		content: Snippet<[SatelliteDid.AutomationConfig]>;
	}

	let { content, satellite }: Props = $props();
</script>

{#if $satelliteAutomationConfig === undefined}
	<SpinnerParagraph>{$i18n.core.loading_config}</SpinnerParagraph>
{:else if $satelliteAutomationConfig === null}
	<div in:fade>
		<NoAutomation />

		<AutomationNew {satellite} />
	</div>
{:else}
	<div in:fade>
		{@render content($satelliteAutomationConfig)}
	</div>
{/if}
