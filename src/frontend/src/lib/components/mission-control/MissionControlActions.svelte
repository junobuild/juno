<script lang="ts">
	import type { Principal } from '@dfinity/principal';
	import CanisterTransferCycles from '$lib/components/canister/CanisterTransferCycles.svelte';
	import TopUp from '$lib/components/canister/TopUp.svelte';
	import Actions from '$lib/components/core/Actions.svelte';
	import MissionControlAttachOrbiter from '$lib/components/mission-control/MissionControlAttachOrbiter.svelte';
	import MissionControlAttachSatellite from '$lib/components/mission-control/MissionControlAttachSatellite.svelte';
	import type { CanisterIcStatus } from '$lib/types/canister';
	import { emit } from '$lib/utils/events.utils';

	interface Props {
		missionControlId: Principal;
	}

	let { missionControlId }: Props = $props();

	let canister: CanisterIcStatus | undefined = $state(undefined);

	let visible: boolean = $state(false);
	const close = () => (visible = false);

	const onSyncCanister = (syncCanister: CanisterIcStatus) => {
		if (syncCanister.id !== missionControlId.toText()) {
			return;
		}

		canister = syncCanister;
	};

	const onTransferCycles = () => {
		close();

		emit({
			message: 'junoModal',
			detail: {
				type: 'transfer_cycles_mission_control',
				detail: {
					cycles: canister?.data?.canister?.cycles ?? 0n
				}
			}
		});
	};
</script>

<svelte:window
	onjunoSyncCanister={({ detail: { canister } }: CustomEvent<{ canister: CanisterIcStatus }>) =>
		onSyncCanister(canister)}
/>

<Actions bind:visible>
	<TopUp type="topup_mission_control" on:junoTopUp={close} />

	<CanisterTransferCycles {canister} onclick={onTransferCycles} />

	<hr />

	<MissionControlAttachSatellite on:junoAttach={close} />

	<MissionControlAttachOrbiter on:junoAttach={close} />
</Actions>
