<script lang="ts">
	import type { Orbiter } from '$declarations/mission_control/mission_control.did';
	import CanisterDelete from '$lib/components/canister/CanisterDelete.svelte';
	import CanisterStopStart from '$lib/components/canister/CanisterStopStart.svelte';
	import CanisterTransferCycles from '$lib/components/canister/CanisterTransferCycles.svelte';
	import SegmentDetach from '$lib/components/canister/SegmentDetach.svelte';
	import TopUp from '$lib/components/canister/TopUp.svelte';
	import Actions from '$lib/components/core/Actions.svelte';
	import type { CanisterIcStatus } from '$lib/types/canister';
	import { emit } from '$lib/utils/events.utils';

	interface Props {
		orbiter: Orbiter;
	}

	let { orbiter }: Props = $props();

	let canister: CanisterIcStatus | undefined = $state(undefined);

	const onSyncCanister = (syncCanister: CanisterIcStatus) => {
		if (syncCanister.id !== orbiter.orbiter_id.toText()) {
			return;
		}

		canister = syncCanister;
	};

	let visible: boolean = $state(false);
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

<svelte:window
	onjunoSyncCanister={({ detail: { canister } }: CustomEvent<CanisterIcStatus>) =>
		onSyncCanister(canister)}
/>

<Actions bind:visible>
	<TopUp type="topup_orbiter" on:junoTopUp={close} />

	<CanisterTransferCycles {canister} on:click={() => onCanisterAction('transfer_cycles_orbiter')} />

	<hr />

	<CanisterStopStart {canister} segment="orbiter" onstop={close} onstart={close} />

	<SegmentDetach segment="orbiter" segmentId={orbiter.orbiter_id} ondetach={close} />

	<CanisterDelete {canister} onclick={() => onCanisterAction('delete_orbiter')} />
</Actions>
