<script lang="ts">
	import TopUp from '$lib/components/canister/TopUp.svelte';
	import Actions from '$lib/components/core/Actions.svelte';
	import CanisterStopStart from '$lib/components/canister/CanisterStopStart.svelte';
	import type { Orbiter } from '$declarations/mission_control/mission_control.did';
	import type { CanisterIcStatus } from '$lib/types/canister';
	import { emit } from '$lib/utils/events.utils';
	import CanisterDelete from '$lib/components/canister/CanisterDelete.svelte';
	import CanisterTransferCycles from '$lib/components/canister/CanisterTransferCycles.svelte';
	import SegmentDetach from '$lib/components/canister/SegmentDetach.svelte';

	export let orbiter: Orbiter;

	let canister: CanisterIcStatus | undefined = undefined;

	const onSyncCanister = (syncCanister: CanisterIcStatus) => {
		if (syncCanister.id !== orbiter.orbiter_id.toText()) {
			return;
		}

		canister = syncCanister;
	};

	let visible: boolean | undefined;
	const close = () => (visible = false);

	const onCanisterAction = (type: 'delete_orbiter' | 'transfer_cycles_orbiter') => {
		close();

		emit({
			message: 'junoModal',
			detail: {
				type,
				detail: {
					cycles: canister?.data?.canister?.cycles ?? 0n
				}
			}
		});
	};
</script>

<svelte:window on:junoSyncCanister={({ detail: { canister } }) => onSyncCanister(canister)} />

<Actions bind:visible>
	<TopUp type="topup_orbiter" on:junoTopUp={close} />

	<CanisterTransferCycles {canister} on:click={() => onCanisterAction('transfer_cycles_orbiter')} />

	<CanisterStopStart {canister} segment="orbiter" on:junoStop={close} on:junoStart={close} />

	<SegmentDetach segment="orbiter" segmentId={orbiter.orbiter_id} on:junoDetach={close} />

	<CanisterDelete {canister} on:click={() => onCanisterAction('delete_orbiter')} />
</Actions>
