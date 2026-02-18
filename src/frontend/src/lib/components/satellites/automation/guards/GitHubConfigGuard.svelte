<script lang="ts">
	import type { Snippet } from 'svelte';
	import { fade } from 'svelte/transition';
	import type { SatelliteDid } from '$declarations';
	import AutomationNew from '$lib/components/satellites/automation/AutomationNew.svelte';
	import NoAutomation from '$lib/components/satellites/automation/NoAutomation.svelte';
	import SpinnerParagraph from '$lib/components/ui/SpinnerParagraph.svelte';
	import { githubConfig } from '$lib/derived/satellite/github.derived';
	import { i18n } from '$lib/stores/app/i18n.store';
	import type { Satellite } from '$lib/types/satellite';

	interface Props {
		satellite: Satellite;
		content: Snippet<[SatelliteDid.OpenIdAutomationProviderConfig]>;
	}

	let { content, satellite }: Props = $props();
</script>

{#if $githubConfig === undefined}
	<SpinnerParagraph>{$i18n.core.loading_config}</SpinnerParagraph>
{:else if $githubConfig === null}
	<div in:fade>
		<NoAutomation />

		<AutomationNew {satellite} />
	</div>
{:else}
	<div in:fade>
		{@render content($githubConfig)}
	</div>
{/if}
