<script lang="ts">
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import CanisterDelete from '$lib/components/canister/CanisterDelete.svelte';
	import CanisterStopStart from '$lib/components/canister/CanisterStopStart.svelte';
	import CanisterTransferCycles from '$lib/components/canister/CanisterTransferCycles.svelte';
	import SegmentDetach from '$lib/components/canister/SegmentDetach.svelte';
	import TopUp from '$lib/components/canister/TopUp.svelte';
	import Actions from '$lib/components/core/Actions.svelte';
	import { listCustomDomains } from '$lib/services/hosting.services';
	import { busy } from '$lib/stores/busy.store';
	import type { CanisterIcStatus } from '$lib/types/canister';
	import { emit } from '$lib/utils/events.utils';

	interface Props {
		satellite: Satellite;
	}

	let { satellite }: Props = $props();

	let detail = { satellite };

	let canister: CanisterIcStatus | undefined = $state(undefined);

	const onSyncCanister = (syncCanister: CanisterIcStatus) => {
		if (syncCanister.id !== satellite.satellite_id.toText()) {
			return;
		}

		canister = syncCanister;
	};

	let visible: boolean = $state(false);
	const close = () => (visible = false);

	const onTransferCycles = () => {
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
	onjunoSyncCanister={({ detail: { canister } }: CustomEvent<CanisterIcStatus>) =>
		onSyncCanister(canister)}
/>

<Actions bind:visible>
	<TopUp type="topup_satellite" {detail} on:junoTopUp={close} />

	<CanisterTransferCycles {canister} on:click={onTransferCycles} />

	<hr />

	<CanisterStopStart {canister} segment="satellite" on:junoStop={close} on:junoStart={close} />

	<SegmentDetach segment="satellite" segmentId={satellite.satellite_id} on:junoStop={close} />

	<CanisterDelete {canister} on:click={onDeleteSatellite} />
</Actions>
