<script lang="ts">
	import CanisterTransferCycles from '$lib/components/modules/canister/cycles/CanisterTransferCycles.svelte';
	import CanisterDelete from '$lib/components/modules/canister/lifecycle/CanisterDelete.svelte';
	import CanisterStopStart from '$lib/components/modules/canister/lifecycle/CanisterStopStart.svelte';
	import TopUp from '$lib/components/modules/canister/top-up/TopUp.svelte';
	import SegmentActions from '$lib/components/modules/segments/SegmentActions.svelte';
	import { listCustomDomains } from '$lib/services/satellite/hosting/custom-domain.services';
	import { busy } from '$lib/stores/app/busy.store';
	import type { CanisterSyncData as CanisterSyncDataType } from '$lib/types/canister';
	import type { Satellite } from '$lib/types/satellite';
	import { emit } from '$lib/utils/events.utils';

	interface Props {
		satellite: Satellite;
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

		busy.start();

		// The modal displays the instruction to remove the domains first before delete
		// using the related store as source of information.
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
					monitoringEnabled,
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
