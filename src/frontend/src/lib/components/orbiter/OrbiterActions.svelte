<script lang="ts">
	import type { Orbiter } from '$declarations/mission_control/mission_control.did';
	import CanisterBuyCycleExpress from '$lib/components/canister/CanisterBuyCycleExpress.svelte';
	import CanisterDelete from '$lib/components/canister/CanisterDelete.svelte';
	import CanisterStopStart from '$lib/components/canister/CanisterStopStart.svelte';
	import CanisterTransferCycles from '$lib/components/canister/CanisterTransferCycles.svelte';
	import SegmentDetach from '$lib/components/canister/SegmentDetach.svelte';
	import TopUp from '$lib/components/canister/TopUp.svelte';
	import SegmentActions from '$lib/components/segments/SegmentActions.svelte';
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

	// eslint-disable-next-line require-await
	const onCanisterAction = async (type: 'delete_orbiter' | 'transfer_cycles_orbiter') => {
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
	onjunoSyncCanister={({ detail: { canister } }: CustomEvent<{ canister: CanisterIcStatus }>) =>
		onSyncCanister(canister)}
/>

<SegmentActions bind:visible segment="orbiter">
	{#snippet cycleActions()}
		<TopUp type="topup_orbiter" on:junoTopUp={close} />

		<CanisterTransferCycles
			{canister}
			onclick={async () => await onCanisterAction('transfer_cycles_orbiter')}
		/>

		<CanisterBuyCycleExpress canisterId={orbiter.orbiter_id} />
	{/snippet}

	{#snippet canisterActions()}
		<CanisterStopStart {canister} segment="orbiter" onstop={close} onstart={close} />

		<SegmentDetach segment="orbiter" segmentId={orbiter.orbiter_id} ondetach={close} />

		<CanisterDelete {canister} onclick={async () => await onCanisterAction('delete_orbiter')} />
	{/snippet}
</SegmentActions>
