<script lang="ts">
	import CanisterBuyCycleExpress from '$lib/components/canister/CanisterBuyCycleExpress.svelte';
	import CanisterTransferCycles from '$lib/components/canister/CanisterTransferCycles.svelte';
	import TopUp from '$lib/components/canister/TopUp.svelte';
	import MissionControlAttachOrbiter from '$lib/components/mission-control/MissionControlAttachOrbiter.svelte';
	import MissionControlAttachSatellite from '$lib/components/mission-control/MissionControlAttachSatellite.svelte';
	import SegmentActions from '$lib/components/segments/SegmentActions.svelte';
	import type { CanisterSyncData } from '$lib/types/canister';
	import type { MissionControlId } from '$lib/types/mission-control';
	import { emit } from '$lib/utils/events.utils';

	interface Props {
		missionControlId: MissionControlId;
	}

	let { missionControlId }: Props = $props();

	let canister: CanisterSyncData | undefined = $state(undefined);

	let visible: boolean = $state(false);
	const close = () => (visible = false);

	const onSyncCanister = (syncCanister: CanisterSyncData) => {
		if (syncCanister.id !== missionControlId.toText()) {
			return;
		}

		canister = syncCanister;
	};

	// eslint-disable-next-line require-await
	const onTransferCycles = async () => {
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
	onjunoSyncCanister={({ detail: { canister } }: CustomEvent<{ canister: CanisterSyncData }>) =>
		onSyncCanister(canister)}
/>

<SegmentActions bind:visible segment="mission_control">
	{#snippet cycleActions()}
		<TopUp type="topup_mission_control" onclose={close} />

		<CanisterTransferCycles {canister} onclick={onTransferCycles} />

		<CanisterBuyCycleExpress canisterId={missionControlId} />
	{/snippet}

	{#snippet canisterActions()}
		<MissionControlAttachSatellite on:junoAttach={close} />

		<MissionControlAttachOrbiter on:junoAttach={close} />
	{/snippet}
</SegmentActions>
