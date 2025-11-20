<script lang="ts">
	import type { MissionControlDid } from '$declarations';
	import CanisterBuyCycleExpress from '$lib/components/canister/CanisterBuyCycleExpress.svelte';
	import CanisterDelete from '$lib/components/canister/CanisterDelete.svelte';
	import CanisterStopStart from '$lib/components/canister/CanisterStopStart.svelte';
	import CanisterTransferCycles from '$lib/components/canister/CanisterTransferCycles.svelte';
	import TopUp from '$lib/components/canister/TopUp.svelte';
	import SegmentActions from '$lib/components/segments/SegmentActions.svelte';
	import { listCustomDomains } from '$lib/services/custom-domain.services';
	import { busy } from '$lib/stores/busy.store';
	import { i18n } from '$lib/stores/i18n.store';
	import { toasts } from '$lib/stores/toasts.store';
	import type { CanisterSyncData as CanisterSyncDataType } from '$lib/types/canister';
	import { emit } from '$lib/utils/events.utils';

	interface Props {
		satellite: MissionControlDid.Satellite;
		canister: CanisterSyncDataType | undefined;
		monitoringEnabled: boolean;
	}

	let { satellite, canister, monitoringEnabled }: Props = $props();

	let detail = $derived({ satellite });

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

<SegmentActions bind:visible>
	{#snippet mainActions()}
		<TopUp {detail} onclose={close} type="topup_satellite" />
	{/snippet}

	{#snippet cyclesActions()}
		<CanisterTransferCycles {canister} onclick={onTransferCycles} />

		<CanisterBuyCycleExpress canisterId={satellite.satellite_id} />
	{/snippet}

	{#snippet lifecycleActions()}
		<CanisterStopStart
			{canister}
			{monitoringEnabled}
			onstart={close}
			onstop={close}
			segment="satellite"
		/>

		<CanisterDelete {canister} onclick={onDeleteSatellite} />
	{/snippet}
</SegmentActions>
