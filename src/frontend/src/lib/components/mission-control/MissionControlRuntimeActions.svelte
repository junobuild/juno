<script lang="ts">
	import CanisterBuyCycleExpress from '$lib/components/canister/CanisterBuyCycleExpress.svelte';
	import CanisterSyncData from '$lib/components/canister/CanisterSyncData.svelte';
	import CanisterTransferCycles from '$lib/components/canister/CanisterTransferCycles.svelte';
	import TopUp from '$lib/components/canister/TopUp.svelte';
	import SegmentActions from '$lib/components/segments/SegmentActions.svelte';
	import type { CanisterSyncData as CanisterSyncDataType } from '$lib/types/canister';
	import type { MissionControlId } from '$lib/types/mission-control';
	import { emit } from '$lib/utils/events.utils';

	interface Props {
		missionControlId: MissionControlId;
	}

	let { missionControlId }: Props = $props();

	let visible: boolean = $state(false);
	const close = () => (visible = false);

	let canister = $state<CanisterSyncDataType | undefined>(undefined);

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

<CanisterSyncData canisterId={missionControlId} bind:canister />

<SegmentActions bind:visible>
	{#snippet mainActions()}
		<TopUp onclose={close} type="topup_mission_control" />
	{/snippet}

	{#snippet cyclesActions()}
		<CanisterTransferCycles {canister} onclick={onTransferCycles} />

		<CanisterBuyCycleExpress canisterId={missionControlId} />
	{/snippet}
</SegmentActions>
