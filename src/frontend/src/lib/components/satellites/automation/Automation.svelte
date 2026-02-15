<script lang="ts">
	import { isNullish } from '@dfinity/utils';
	import { setContext } from 'svelte';
	import { fade } from 'svelte/transition';
	import AutomationConfigLoader from '$lib/components/satellites/automation/AutomationConfigLoader.svelte';
	import AutomationNew from '$lib/components/satellites/automation/AutomationNew.svelte';
	import NoAutomation from '$lib/components/satellites/automation/NoAutomation.svelte';
	import WorkflowsContext from '$lib/components/satellites/automation/workflows/WorkflowsContext.svelte';
	import { initAutomationConfigContext } from '$lib/stores/satellite/automation.context.store';
	import {
		AUTOMATION_CONFIG_CONTEXT_KEY,
		type AutomationConfigContext
	} from '$lib/types/automation.context';
	import type { Satellite } from '$lib/types/satellite';

	interface Props {
		satellite: Satellite;
	}

	let { satellite }: Props = $props();

	const { config, ...contextRest } = initAutomationConfigContext();

	setContext<AutomationConfigContext>(AUTOMATION_CONFIG_CONTEXT_KEY, { config, ...contextRest });
</script>

<AutomationConfigLoader {satellite}>
	{#if isNullish($config)}
		<NoAutomation />

		<AutomationNew {satellite} />
	{:else}
		<div in:fade>
			<WorkflowsContext {satellite} />
		</div>
	{/if}
</AutomationConfigLoader>
