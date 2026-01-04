<script lang="ts">
	import MonitoringCreateWizard from '$lib/components/monitoring/create/MonitoringCreateWizard.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import type { JunoModalDetail, JunoModalCreateMonitoringStrategyDetail } from '$lib/types/modal';

	interface Props {
		detail: JunoModalDetail;
		onclose: () => void;
	}

	let { detail, onclose }: Props = $props();

	let { settings, user, missionControlId } = $derived(
		detail as JunoModalCreateMonitoringStrategyDetail
	);

	let onback = $state<(() => void) | undefined>();
</script>

<Modal {onback} {onclose}>
	<MonitoringCreateWizard {missionControlId} {onclose} {settings} {user} bind:onback />
</Modal>
