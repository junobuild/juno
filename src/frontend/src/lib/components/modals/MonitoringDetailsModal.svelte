<script lang="ts">
	import Modal from '$lib/components/ui/Modal.svelte';
	import type { JunoModalDetail, JunoModalMonitoringDetail } from '$lib/types/modal';
	import CanisterOverview from '$lib/components/canister/CanisterOverview.svelte';
	import CanisterMonitoring from '$lib/components/canister/CanisterMonitoring.svelte';
	import { i18n } from '$lib/stores/i18n.store';
	import { Principal } from '@dfinity/principal';

	interface Props {
		detail: JunoModalDetail;
		onclose: () => void;
	}

	let { detail, onclose }: Props = $props();

	let { segment, canisterData, monitoringData } = $derived(detail as JunoModalMonitoringDetail);

    let canisterId = $derived(Principal.fromText(segment?.canisterId));
</script>

<Modal on:junoClose={onclose}>
	<div class="card-container with-title">
		<span class="title">{$i18n.monitoring.title}</span>

		<div class="columns-3">
			<CanisterOverview {canisterId} segment={segment.segment} />

			<CanisterMonitoring {canisterId} segment={segment.segment} />
		</div>
	</div>
</Modal>
