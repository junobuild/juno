<script lang="ts">
	import { nonNullish } from '@dfinity/utils';
	import FactoryDeleteWizard from '$lib/components/factory/delete/FactoryDeleteWizard.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import { orbiter } from '$lib/derived/orbiter.derived';
	import type { JunoModalDeleteSegmentDetail, JunoModalDetail } from '$lib/types/modal';

	interface Props {
		detail: JunoModalDetail;
		onclose: () => void;
	}

	let { detail, onclose }: Props = $props();

	let { cycles: currentCycles, monitoringEnabled } = $derived(
		detail as JunoModalDeleteSegmentDetail
	);

	// TODO: resolve no-non-null-assertion
	// We know for sure that the orbiter is defined at this point.
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	let segmentId = $derived($orbiter!.orbiter_id);
</script>

{#if nonNullish($orbiter)}
	<Modal {onclose}>
		<FactoryDeleteWizard
			{currentCycles}
			{monitoringEnabled}
			{onclose}
			segment="analytics"
			{segmentId}
		/>
	</Modal>
{/if}
