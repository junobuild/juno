<script lang="ts">
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import CanisterBuyCycleExpress from '$lib/components/canister/CanisterBuyCycleExpress.svelte';
	import CanisterDelete from '$lib/components/canister/CanisterDelete.svelte';
	import CanisterStopStart from '$lib/components/canister/CanisterStopStart.svelte';
	import CanisterTransferCycles from '$lib/components/canister/CanisterTransferCycles.svelte';
	import SegmentDetach from '$lib/components/canister/SegmentDetach.svelte';
	import TopUp from '$lib/components/canister/TopUp.svelte';
	import SegmentActions from '$lib/components/segments/SegmentActions.svelte';
	import { listCustomDomains } from '$lib/services/hosting.services';
	import { busy } from '$lib/stores/busy.store';
	import type { CanisterSyncData } from '$lib/types/canister';
	import { emit } from '$lib/utils/events.utils';

	interface Props {
		satellite: Satellite;
	}

	let { satellite }: Props = $props();

	let detail = { satellite };

	let canister: CanisterSyncData | undefined = $state(undefined);

	const onSyncCanister = (syncCanister: CanisterSyncData) => {
		if (syncCanister.id !== satellite.satellite_id.toText()) {
			return;
		}

		canister = syncCanister;
	};

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

<svelte:window
	onjunoSyncCanister={({ detail: { canister } }: CustomEvent<{ canister: CanisterSyncData }>) =>
		onSyncCanister(canister)}
/>

<SegmentActions bind:visible segment="satellite">
	{#snippet cycleActions()}
		<TopUp type="topup_satellite" {detail} onclose={close} />

		<CanisterTransferCycles {canister} onclick={onTransferCycles} />

		<CanisterBuyCycleExpress canisterId={satellite.satellite_id} />
	{/snippet}

	{#snippet canisterActions()}
		<CanisterStopStart {canister} segment="satellite" onstop={close} onstart={close} />

		<SegmentDetach segment="satellite" segmentId={satellite.satellite_id} ondetach={close} />

		<CanisterDelete {canister} onclick={onDeleteSatellite} />
	{/snippet}
</SegmentActions>
