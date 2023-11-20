<script lang="ts">
	import type { Satellite } from '$declarations/mission_control/mission_control.did';
	import TopUp from '$lib/components/canister/TopUp.svelte';
	import CanisterStopStart from '$lib/components/canister/CanisterStopStart.svelte';
	import type { Canister } from '$lib/types/canister';
	import Actions from '$lib/components/core/Actions.svelte';
	import { emit } from '$lib/utils/events.utils';
	import CanisterTransferCycles from '$lib/components/canister/CanisterTransferCycles.svelte';
	import CanisterDelete from '$lib/components/canister/CanisterDelete.svelte';

	export let satellite: Satellite;

	let detail = { satellite };

	let canister: Canister | undefined = undefined;

	const onSyncCanister = (syncCanister: Canister) => {
		if (syncCanister.id !== satellite.satellite_id.toText()) {
			return;
		}

		canister = syncCanister;
	};

	let visible: boolean | undefined;
	const close = () => (visible = false);

	const onCanisterAction = (type: 'delete_satellite' | 'transfer_cycles_satellite') => {
		close();

		emit({
			message: 'junoModal',
			detail: {
				type,
				detail: {
					satellite,
					cycles: canister?.data?.cycles ?? 0n
				}
			}
		});
	};
</script>

<svelte:window on:junoSyncCanister={({ detail: { canister } }) => onSyncCanister(canister)} />

<Actions bind:visible>
	<TopUp type="topup_satellite" {detail} on:junoTopUp={close} />

	<CanisterTransferCycles {canister} on:click={() => onCanisterAction('transfer_cycles_satellite')} />

	<CanisterStopStart {canister} segment="satellite" on:junoStop={close} on:junoStart={close} />

	<CanisterDelete {canister} on:click={() => onCanisterAction('delete_satellite')} />
</Actions>
