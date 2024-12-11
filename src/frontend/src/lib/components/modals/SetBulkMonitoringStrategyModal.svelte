<script lang="ts">
	import type { JunoModalDetail, JunoModalMonitoringSetBulkStrategyDetail } from '$lib/types/modal';
	import Modal from '$lib/components/ui/Modal.svelte';

	interface Props {
		detail: JunoModalDetail;
		onclose: () => void;
	}

	let { detail, onclose }: Props = $props();

	let { settings } = $derived(detail as JunoModalMonitoringSetBulkStrategyDetail);
</script>

<Modal on:junoClose={onclose}>saldkm</Modal>
