<script lang="ts">
	import { isNullish } from '@dfinity/utils';
	import { onDestroy, onMount, type Snippet } from 'svelte';
	import { satelliteAutomationConfig } from '$lib/derived/satellite/satellite-configs.derived';
	import { satellite } from '$lib/derived/satellite.derived';
	import { WorkflowsWorker } from '$lib/services/workers/worker.workflows.services';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	let worker = $state<WorkflowsWorker | undefined>();

	const initWorker = async () => {
		worker = await WorkflowsWorker.init();
	};

	$effect(() => {
		if (isNullish($satellite)) {
			worker?.stop();
			return;
		}

		if (isNullish($satelliteAutomationConfig)) {
			worker?.stop();
			return;
		}

		worker?.start({
			satelliteId: $satellite.satellite_id
		});
	});

	onMount(async () => await initWorker());
	onDestroy(() => worker?.terminate());
</script>

{@render children?.()}
