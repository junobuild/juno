<script lang="ts">
	import Modal from '$lib/components/ui/Modal.svelte';
	import type { JunoModalDetail, JunoModalMonitoringDetail } from '$lib/types/modal';

	interface Props {
		detail: JunoModalDetail;
		onclose: () => void;
	}

	let { detail, onclose }: Props = $props();

	let { segment, canisterData, monitoringData } = $derived(detail as JunoModalMonitoringDetail);
</script>

<Modal on:junoClose={onclose}>Hello</Modal>
