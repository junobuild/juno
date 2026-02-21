<script lang="ts">
	import type { Satellite } from '$lib/types/satellite';
	import type { Workflow, WorkflowKey } from '$lib/types/workflow';
	import type { Option } from '$lib/types/utils';
	import { toasts } from '$lib/stores/app/toasts.store';
	import { satelliteAutomationConfig } from '$lib/derived/satellite/satellite-configs.derived';
	import { untrack } from 'svelte';
	import { loadLastWorkflow } from '$lib/services/satellite/automation/workflows.services';
	import { authIdentity } from '$lib/derived/auth.derived';
    import {isNullish, nonNullish} from '@dfinity/utils';
	import { fade } from 'svelte/transition';
    import Value from "$lib/components/ui/Value.svelte";
    import {i18n} from "$lib/stores/app/i18n.store";
    import {versionStore} from "$lib/stores/version.store";

	interface Props {
		satellite: Satellite;
	}

	let { satellite }: Props = $props();

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
	<div in:fade>
        <Value>
            {#snippet label()}
                {$i18n.satellites.build}
            {/snippet}

            asd
        </Value>
    </div>
{/if}
