<script lang="ts">
	import type { Satellite } from '$lib/types/satellite';
	import type { Workflow, WorkflowKey } from '$lib/types/workflow';
	import type { Option } from '$lib/types/utils';
	import { toasts } from '$lib/stores/app/toasts.store';
	import { satelliteAutomationConfig } from '$lib/derived/satellite/satellite-configs.derived';
    import {type Snippet, untrack} from 'svelte';
	import { loadLastWorkflow } from '$lib/services/satellite/automation/workflows.services';
	import { authIdentity } from '$lib/derived/auth.derived';
    import {isNullish, nonNullish} from '@dfinity/utils';
    import {versionStore} from "$lib/stores/version.store";

	interface Props {
		satellite: Satellite;
        content: Snippet<[[WorkflowKey, Workflow]]>;
	}

	let { satellite, content }: Props = $props();

    let satelliteId = $derived(satellite.satellite_id);

	let workflow = $state<Option<[WorkflowKey, Workflow]>>(undefined);

	const load = async () => {
        const version = $versionStore?.satellites[satelliteId.toText()]?.current;

        if (isNullish(version)) {
            workflow = undefined;
            return;
        }

        if ($satelliteAutomationConfig === undefined) {
            workflow = undefined;
            return;
        }

        if ($satelliteAutomationConfig === null) {
            workflow = null;
            return;
        }

		try {
			workflow = await loadLastWorkflow({
				identity: $authIdentity,
				satelliteId
			});
		} catch (err: unknown) {
			toasts.error({
				text: 'sddfsdf',
				detail: err
			});
		}
	};

	$effect(() => {
        satelliteId;
        $versionStore;
		$satelliteAutomationConfig;

		untrack(load);
	});
</script>

{#if nonNullish(workflow)}
    {@render content(workflow)}
{/if}
