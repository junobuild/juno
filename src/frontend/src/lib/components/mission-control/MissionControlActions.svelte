<script lang="ts">
	import TopUp from '$lib/components/canister/TopUp.svelte';
	import Actions from '$lib/components/core/Actions.svelte';
	import CanisterTransferCycles from '$lib/components/canister/CanisterTransferCycles.svelte';
	import { emit } from '$lib/utils/events.utils';
	import type { CanisterIcStatus } from '$lib/types/canister';
	import type { Principal } from '@dfinity/principal';

	export let missionControlId: Principal;

	let canister: CanisterIcStatus | undefined = undefined;

	let visible: boolean | undefined;
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

<svelte:window on:junoSyncCanister={({ detail: { canister } }) => onSyncCanister(canister)} />

<Actions bind:visible>
	<TopUp type="topup_mission_control" on:junoTopUp={close} />

	<CanisterTransferCycles {canister} on:click={onTransferCycles} />
</Actions>
