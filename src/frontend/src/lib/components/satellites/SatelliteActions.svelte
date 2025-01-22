<script lang="ts">
	import { fromNullishNullable } from '@dfinity/utils';
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import CanisterBuyCycleExpress from '$lib/components/canister/CanisterBuyCycleExpress.svelte';
	import CanisterDelete from '$lib/components/canister/CanisterDelete.svelte';
	import CanisterStopStart from '$lib/components/canister/CanisterStopStart.svelte';
	import CanisterSyncData from '$lib/components/canister/CanisterSyncData.svelte';
	import CanisterTransferCycles from '$lib/components/canister/CanisterTransferCycles.svelte';
	import SegmentDetach from '$lib/components/canister/SegmentDetach.svelte';
	import TopUp from '$lib/components/canister/TopUp.svelte';
	import SegmentActions from '$lib/components/segments/SegmentActions.svelte';
	import { listCustomDomains } from '$lib/services/hosting.services';
	import { busy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { toasts } from '$lib/stores/toasts.store';
	import type { CanisterSyncData as CanisterSyncDataType } from '$lib/types/canister';
	import { emit } from '$lib/utils/events.utils';

	interface Props {
		satellite: Satellite;
	}

	let { satellite }: Props = $props();

	let monitoring = $derived(
		fromNullishNullable(fromNullishNullable(satellite.settings)?.monitoring)
	);

	let monitoringEnabled = $derived(fromNullishNullable(monitoring?.cycles)?.enabled === true);

	let detail = { satellite };

	let canister = $state<CanisterSyncDataType | undefined>(undefined);

	let visible: boolean = $state(false);
	const close = () => (visible = false);

	// eslint-disable-next-line require-await
	const onTransferCycles = async () => {
		close();

		emit({
			message: 'junoModal',
			detail: {
				type: 'transfer_cycles_satellite',
				detail: {
					satellite,
					cycles: canister?.data?.canister?.cycles ?? 0n
				}
			}
		});
	};

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

<CanisterSyncData canisterId={satellite.satellite_id} bind:canister />

<SegmentActions bind:visible segment="satellite">
	{#snippet cycleActions()}
		<TopUp type="topup_satellite" {detail} onclose={close} />

		<CanisterTransferCycles {canister} onclick={onTransferCycles} />

		<CanisterBuyCycleExpress canisterId={satellite.satellite_id} />
	{/snippet}

	{#snippet canisterActions()}
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
