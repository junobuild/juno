<script lang="ts">
	import { fromNullishNullable } from '@dfinity/utils';
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import CanisterDelete from '$lib/components/canister/CanisterDelete.svelte';
	import CanisterStopStart from '$lib/components/canister/CanisterStopStart.svelte';
	import SegmentDetach from '$lib/components/canister/SegmentDetach.svelte';
	import SatelliteVisit from '$lib/components/satellites/SatelliteVisit.svelte';
	import SegmentActions from '$lib/components/segments/SegmentActions.svelte';
	import { listCustomDomains } from '$lib/services/custom-domain.services';
	import { busy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { toasts } from '$lib/stores/toasts.store';
	import type { CanisterSyncData as CanisterSyncDataType } from '$lib/types/canister';
	import { emit } from '$lib/utils/events.utils';

	interface Props {
		satellite: Satellite;
		canister: CanisterSyncDataType | undefined;
	}

	let { satellite, canister }: Props = $props();

	let monitoring = $derived(
		fromNullishNullable(fromNullishNullable(satellite.settings)?.monitoring)
	);

	let monitoringEnabled = $derived(fromNullishNullable(monitoring?.cycles)?.enabled === true);

	let visible: boolean = $state(false);
	const close = () => (visible = false);

	const onDeleteSatellite = async () => {
		close();

		// TODO: can be removed once the mission control is patched to disable monitoring on delete
		if (monitoringEnabled) {
			toasts.warn($i18n.monitoring.warn_monitoring_enabled);
			return;
		}

		busy.start();

		const { success } = await listCustomDomains({
			satelliteId: satellite.satellite_id,
			reload: true
		});

		busy.stop();

		if (!success) {
			return;
		}

		emit({
			message: 'junoModal',
			detail: {
				type: 'delete_satellite',
				detail: {
					satellite,
					cycles: canister?.data?.canister?.cycles ?? 0n
				}
			}
		});
	};
</script>

<SegmentActions bind:visible>
	{#snippet mainActions()}
		<SatelliteVisit {satellite} />
	{/snippet}

	{#snippet moreActions()}
		<CanisterStopStart
			{canister}
			{monitoringEnabled}
			segment="satellite"
			onstop={close}
			onstart={close}
		/>

		<SegmentDetach
			segment="satellite"
			segmentId={satellite.satellite_id}
			{monitoringEnabled}
			ondetach={close}
		/>

		<CanisterDelete {canister} onclick={onDeleteSatellite} />
	{/snippet}
</SegmentActions>
